'use strict';

var multer = require('multer')
  , fs = require('fs')
  , config = require('./config');


var onFileUploadStart = function(file) {
  /*
   * Check if file type is jpg, jpeg, png or gif
   */

  return /^.*\.(jpg|jpeg|png|gif)/i.test(file.name);
};

var onError = function(error, next) {
  next(error);
};

var onFileSizeLimit = function(file) {
  fs.unlink('./' + file.path);
  console.log('File', file.originalname, 'too big. Deleted.');
};

var options = config.multer;

if (!options.onError) { options.onError = onError; }
if (!options.onFileSizeLimit) { options.onFileSizeLimit = onFileSizeLimit; }
if (!options.onFileUploadStart) { options.onFileUploadStart = onFileUploadStart; }

module.exports = multer(options);