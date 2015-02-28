var fs = require('fs')
  , im = require('imagemagick')
  , imageSize = require('image-size');

exports = module.exports = function(req, res, next, options, done) {
  var workflow = new (require('events').EventEmitter)();

  workflow.on('check request', function() {
    if (!options.root) {
      fs.unlink('./' + options.filepath);
      return workflow.emit('response', new Error('type required'));
    }
    if (!options.filepath) {
      return workflow.emit('response', new Error('no file uploaded'));
    }

    workflow.emit('get file infos and check mime');
  });

  workflow.on('get file infos and check mime', function() {
    var reg = options.filepath.match(/\/?([^/.]*)\.(jpg|jpeg|png|gif)/i);
    workflow.outcome = { original: null, minified: null };
    workflow.imgName = reg[1];
    workflow.imgExt = reg[2];
    workflow.imgSize = imageSize(options.filepath);
    req.app.ms.getFileMime(options.filepath, function(err, mime) {
      if (err) { return workflow.emit('response', err); }

      workflow.imgMime = mime;
      // Should add some check on mimeType instead of extension of file (and thus setting file ext using mime)

      workflow.emit('save original file');
    });
  });

  workflow.on('save original file', function() {
    var toCreate = {
        content_type: workflow.imgMime
      , metadata: {
          user: req.user._id
        }
      , root: options.root
    };
    if (req.body.metaType) {
      if (req.body.metaType === "avatar") { toCreate.metadata.type = "avatar"; }
      else if (req.body.metaType === "event") { toCreate.metadata.type = "event"; }
    }
    if (req.body.event)
      toCreate.metadata.event = req.app.ms.Grid.tryParseObjectId(req.body.event);
    req.app.ms.getFileWriteStream(toCreate, workflow.imgExt, function(err, writeStream) {
      if (err) { return workflow.emit('response', err); }

      fs.createReadStream(options.filepath).pipe(writeStream);

      writeStream.on('close', function(file) {
        workflow.outcome.original = options.root + '/' + file.filename;
        if (options.min === false)
          return workflow.emit('response');
        workflow.emit('minify', writeStream.the_id);
      });

      writeStream.on('error', function(err) {
        workflow.emit('response', err);
      })
    });
  });

  workflow.on('minify', function(id) {
    workflow.imgNameMin = workflow.imgName + '.min' + workflow.imgExt;

    im.resize({
        srcPath: options.filepath
      , dstPath: req.app.Config.multer.dest + workflow.imgNameMin
      , quality: 0.7
      , width: 500
      , height: 500
      , format: workflow.imgExt
    }, function(err, stdout, stderr) {
      fs.unlink(options.filepath);
      if (err) { return workflow.emit('response', err); }
      var toCreate = {
          _id: id
        , content_type: workflow.imgMime
        , metadata: {
            user: req.user._id
          }
        , root: options.root + '.min'
      };
      if (req.body.metaType) {
        if (req.body.metaType === "avatar") { toCreate.metadata.type = "avatar"; }
        else if (req.body.metaType === "event") { toCreate.metadata.type = "event"; }
      }
      if (req.body.event)
        toCreate.metadata.event = req.app.ms.Grid.tryParseObjectId(req.body.event);
      req.app.ms.getFileWriteStream(toCreate, 'min.' + workflow.imgExt, function(err, writeStream) {
        if (err) { return workflow.emit('response', err); }

        fs.createReadStream(req.app.Config.multer.dest + workflow.imgNameMin).pipe(writeStream);

        writeStream.on('close', function(file) {
          fs.unlink(req.app.Config.multer.dest + workflow.imgNameMin);

          workflow.outcome.minified = options.root + '/' + file.filename;

          return workflow.emit('response');
        });
      });
    });
  });

  workflow.on('response', function(err) {
    if (err) { return next(err); }
    console.log(workflow.outcome);
    if (done)
      return done(workflow.outcome);
    return res.json(workflow.outcome);
  });

  workflow.emit('check request');
};