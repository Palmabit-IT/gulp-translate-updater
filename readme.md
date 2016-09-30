## Synopsis

A Gulp task that updates translations in .js files by merging new keys and updating old ones from *.json files.

## Installation

```
npm install gulp-translate-updater
```

## Motivation

Let's suppose you have your app localizations in yourproject/translations/<country_code>.js files.
Each file looks like this:

```js
var translations_en = {
    "KEY1": "localization1",
    "KEY2": "localization2"
}
```

Then you have updated tranlations in .json files containing:+

```js
{
    "translations_en": {
        "KEY1": "localization1-updated",
        "KEY3": "localization3-new"
    }
}
```
and you want to update you .js files without doing it manually. This package provides a Gulp task that does it automatically.
Your xx.js files be updated like this:

```js
var translations_en = {
    "KEY1": "localization1-updated",
    "KEY2": "localization2",
    "KEY3": "localization3-new"
}
```

## Code Example

Place your new <country_code>.json translations in yourproject/translations_new/
Add the following line to your gulpfile.js (or create one in your project root):

```js
var transupdate = require('gulp-translate-updater');
```

Then run:

```
gulp transupdate
```

Your translations/*.js files will be updated and old ones will be stored in yourproject/translations_old/ as a backup. Note that only one backup is saved, so every time you run "gulp transupdate" the old backup will be overwritten.

If you add new strings in your main translations/xx.js file and you want to know which ones are missing in your other localization files, so to have them translated, just run:

```
gulp transcompare --master=<country_code>
```

E.g.:

```
gulp transcompare --master=en
```
where "en.js" is your main localization file.
The task will generate inside of yourproject/translations_diff/ .json and .csv files containing all the string that are in your main xx.js file, but are missing in your other translations files.

## Contributors

Daniele Rubetti @ Palmabit

## License

The MIT License (MIT)

Copyright (c) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.