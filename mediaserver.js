var express = require('express')
  , fs = require('fs')
  , im = require('imagemagick')
  , imageSize = require('image-size')
  , zlib = require('zlib')
  , router = express.Router();

exports.Router = function(app, passport) {
  router.get('/:root/:file.:type.:min?', function(req, res, next) {
    if (req.params.min && req.params.type != 'min')
      return next();

    var find = {
      filename: req.params.file + '.' + (req.params.min ? req.params.type + '.' + req.params.min : req.params.type)
    }

    var root = req.params.root + (req.params.min ? '.min' : '');
    req.app.ms.getFileReadStream(find, root, function(err, stream) {
      if (err) { return next(err); }
      if (!stream) { return next(new Error('NULL stream argument')); }

      var statusCode = req.app.ms.Grid.setCacheControl(stream.metadatas, req, res);
      res.status(statusCode)
      if (statusCode == 304) {
        return res.send();
      }
      var acceptEncoding = req.headers['accept-encoding'] && (req.headers['accept-encoding'].split(', ').indexOf('gzip') != -1);
      var gzip = req.app.config.gzip && acceptEncoding;
      if (!gzip) {
        res.setHeader('Content-Length', stream.file.length);
      } else {
        res.setHeader('Content-Encoding', 'gzip');
        return stream.pipe(zlib.createGzip(null)).pipe(res);
      }
      return stream.pipe(res);
    });
  });

  router.post('/upload',
     function(req, res, next) {
        req.app.modules.Upload.OriginalAndMinified(req, res, next, { root: req.body.type, filepath: './' + req.files.file.path.split('\\').join('/') });
    }
  );

  router.use(function(req, res, next) {
    if (req.files) {
      fs.unlink(req.files[Object.keys(req.files)[0]].path)
    }
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  return router;
};

module.exports = exports.Router;