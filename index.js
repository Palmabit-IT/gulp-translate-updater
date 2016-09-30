var _ = require('lodash');
var merge = require('gulp-merge-json');
var beautify = require('gulp-beautify');
var argv = require('yargs').argv;
var convert = require("gulp-convert");
var combine_languagefiles = require("gulp-combine-languagefiles");
var fs = require('fs');
var gulp = require('gulp');
var del = require('del');

function transapply (func, ext, dir) {
  dir = dir || 'translations';
  var files = fs.readdirSync(dir, 'utf8');
  files = files.filter(function (element) {
    return element.indexOf('.') !== 0 && element.slice(-ext.length) === ext;
  });
  files.forEach(function (fileName) {
    func(fileName);
  });
}

gulp.task('trans2json', function (done) {
  var ext = '.js';
  transapply(function (fileName) {
    eval(fs.readFileSync('translations/' + fileName, 'utf8'));
    var lang = fileName.slice(0, fileName.length-ext.length);
    fs.writeFileSync('translations/' + fileName + 'on', '{ "translations_' + lang + '" : ' + JSON.stringify(eval('translations_' + lang)) +'}');
  }, ext);
  done();
});

gulp.task('transmerge', ['trans2json'], function () {
  return gulp.src(['translations/*.json', 'translations_new/*.json'])
    .pipe(merge('transmerged.json'))
    .pipe(gulp.dest('translations'));
});

gulp.task('transmove', ['transmerge'], function () {
  return gulp.src('translations/*.js')
    .pipe(gulp.dest('translations_old'))
});

gulp.task('transclean', ['transmove'], function (done) {
  transapply(function (fileName) {
    fs.writeFileSync('translations/' + fileName, '');
  }, '.js');
  done();
});

gulp.task('transplit', ['transclean'], function (done) {
  var input = require('../../translations/transmerged.json');
  for (var key in input) {
    var transName = key.substring(key.indexOf('_') + 1);
    var fileName = transName + '.js';
    var fileContents = 'var translations_' + transName + '= ' + JSON.stringify(input[key]);
    fs.writeFileSync('translations/' + fileName, fileContents);
  }
  done();
});

gulp.task('transbeautify', ['transplit'], function () {
  return gulp.src('translations/*.js')
    .pipe(beautify({indentSize: 2}))
    .pipe(gulp.dest('translations'));
});

gulp.task('transdelete', ['transbeautify'], function () {
  return del('translations/*.json');
});

gulp.task('transupdate', ['transdelete']);

function compare (item1, item2, diff) {
  for (var key in item1) {
    if (!item2.hasOwnProperty(key)) {
      diff[key] = item1[key];
    }
    else if (typeof item2[key] === 'object' && item2[key] !== null) {
      var newDiff = {};
      newDiff = compare(item1[key], item2[key], newDiff);
      Object.keys(newDiff) && Object.keys(newDiff).length ? diff[key] = newDiff : null;
    }
  }
  return diff;
}

gulp.task('diffclean', function (done) {
  try {
    fs.accessSync('translations_diff/');
  }
  catch (e) {
    fs.mkdirSync('translations_diff');
  }
  transapply(function (fileName) {
    fs.writeFileSync('translations_diff/' + fileName, '');
  }, '.json', 'translations_diff');
  transapply(function (fileName) {
    fs.writeFileSync('translations_diff/' + fileName, '');
  }, '.csv', 'translations_diff');
  done();
});

gulp.task('transdiff', ['diffclean'], function (done) {
  if (!argv.master) {
    console.log('Please provide master language with --master=xx (eg: transcompare --master=en)');
    done();
  }
  else {
    var master = argv.master;
    var ext = '.js';
    var files = fs.readdirSync('translations', 'utf8');
    files = files.filter(function (element) {
      return element.indexOf('.') !== 0 && element.slice(-ext.length) === ext;
    });
    for (var i = 0; i < files.length; i++) {
      eval(fs.readFileSync('translations/' + files[i], 'utf8'));
    }
    transapply(function (fileName) {
      var diff = {};
      var lang = fileName.slice(0, fileName.length-ext.length);
      if (lang !== master) {
        fs.writeFileSync('translations_diff/' + fileName + 'on', '{ "translations_' + lang + '": ' + JSON.stringify(compare(eval('translations_' + master), eval('translations_' + lang), diff)) + '}');
      }
    }, ext);
    done();
  }
});

gulp.task('diffbeautify', ['transdiff'], function () {
  return gulp.src('translations_diff/*.json')
    .pipe(beautify({indentSize: 2}))
    .pipe(gulp.dest('translations_diff'));
});

gulp.task('diff2csv', ['diffbeautify'], function () {
  return gulp.src('translations_diff/*.json')
    .pipe(combine_languagefiles('diff.json', { includeHeader: true }))
    .pipe(convert({from: 'json', to: 'csv'}))
    .pipe(gulp.dest('translations_diff'));
});

gulp.task('transcompare', ['diff2csv']);