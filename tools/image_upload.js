var path = require('path');
var upload_type = {
  avatar: {
    'account': {
      referer: 'user',
      directory: 'avatars/',
      mendatory: true
    },
    'pro': {
      referer: 'pro',
      directory: 'avatars/',
      mendatory: true
    },
    allowed: {
      'gif': {
        mime: 'image/gif',
        enabled: true
      },
      'jpg': {
        mime: 'image/jpeg',
        enabled: true
      },
      'jpeg': {
        mime: 'image/jpeg',
        enabled: true
      },
      'png': {
        mime: 'image/png',
        enabled: true
      }
    }
  },
  event: {
    'account': {
      referer: 'account/propose',
      directory: 'events/',
      mendatory: {
        aevent: false,
        eevent: true,
      }
    },
    'pro': {
      referer: 'homepro/propose',
      directory: 'events/',
      mendatory: {
        aevent: false,
        eevent: true,
        oevent: false
      }
    },
    allowed: {
      'gif': {
        mime: 'image/gif',
        enabled: true
      },
      'jpg': {
        mime: 'image/jpeg',
        enabled: true
      },
      'jpeg': {
        mime: 'image/jpeg',
        enabled: true
      },
      'png': {
        mime: 'image/png',
        enabled: true
      }
    }
  }
}

var fs = require('fs');

function isFileTypeEnabled(tab, ext, mime) {
  var arr = tab.allowed[ext];
  console.log(arr);
  console.log(ext);
  console.log(mime);
  if (arr && arr.mime == mime && arr.enabled === true)
    return true;
  return false;
}

exports.init = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
  var options = upload_type[req.params.type];
  var directory = options[req.session.accType].directory;

  if (req.files.files.size > 12582912)
    return workflow.emit('exception', 'Taille maximale du fichier: 12 Mo');
  if (req.body.utype == "edit") {
    return upload[req.params.type](req, res, directory, req.files.files.extension, next);
  }
  var header = req.headers;

  if (header.referer.length > 0) {
    var referer = (/(https|http):\/\/.*?\/(.*)\//).exec(header.referer);
    if (options && referer[2] && options[req.session.accType].referer == referer[2] && req.files.files.extension && isFileTypeEnabled(options, req.files.files.extension, req.files.files.mimetype)) {
      return upload[req.params.type](req, res, directory, req.files.files.extension, next);
    }
  }
  fs.unlink(path.resolve('uploads')+'/'+req.files.files.name);
  return workflow.emit('exception', 'Filetype '+req.files.files.mimetype+' not allowed.')
};

var upload = {
  avatar: function(req, res, directory, ext, next){
    var tmp_path = req.files.files.path;
    var target_path = './uploads/' + directory + req.session.accType + '_' + req.user.roles[req.session.accType]._id +'.'+ ext;
    var target_path_name = req.session.accType + '_' + req.user.roles[req.session.accType]._id +'.'+ ext;
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('checkMIME', function() {
      if (req.files.files.mimetype.split("/")[0] !== "image") {
        return workflow.emit('exception', 'File must be an image');
      }
      workflow.emit('upload');
    });

    workflow.on('upload', function() {
      console.log(req.files.files);
      console.log(req.app.gfs);
      var writestream = req.app.gfs.createWriteStream({
        filename: target_path_name,
        mode: 'w',
        root: 'avatars',
        metadata: req.files.files,
        content_type: req.files.files.mimetype
      });
      // path.resolve(__dirname+'\\..\\uploads')+'\\'+req.files.files.name
      req.app.gfs.createReadStream(path.resolve(req.files.files.path).replace(/\\/g,"/"))
        .on('end', function(e) {
          console.log("end".green);
          console.log(e);
        })
        .on('error', function(e) {
          console.log("error".red);
          console.log(e);
        }).pipe(writestream);
      fs.rename(tmp_path, target_path, function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }
        target_path = target_path.substring(1);
        workflow.emit('updateAvatar');
      });
    })

    workflow.on('updateAvatar', function() {
      var fieldToSet = {
        picture: target_path
      };

      req.app.db.models[req.session.accType.capitalize()].findByIdAndUpdate(req.user.roles[req.session.accType]._id, fieldToSet, function(err, user) {
        if (err)
          return workflow.emit('exception', err);
        else if (!user)
          return workflow.emit('exception', 'An error occured');
        workflow.outcome.picture = target_path;
        workflow.outcome.user = user;
        return workflow.emit('response');
      });
    });

    workflow.emit('checkMIME');
  },
  event: function(req, res, directory, ext, next){
    var tmp_path = req.files.files.path;
    var target_path = './uploads/' + directory + req.body.type + '_' + req.body.id +'.'+ ext;
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('checkMIME', function() {
      if (req.files.files.mimetype.split("/")[0] !== "image") {
        return workflow.emit('exception', 'File must be an image');
      }
      workflow.emit('upload');
    });

    workflow.on('upload', function() {
      fs.rename(tmp_path, target_path, function(err) {
        if (err) {
          return workflow.emit('exception', err);
        }
        target_path = target_path.substring(1);
        workflow.emit('updateEvent');
      });
    })

    workflow.on('updateEvent', function() {
      var fieldToSet = {
        photos: target_path
      };

      req.app.db.models[req.body.type.capitalize()].findByIdAndUpdate(req.body.id, fieldToSet, function(err, user) {
        if (err)
          return workflow.emit('exception', err);
        else if (!user)
          return workflow.emit('exception', 'An error occured');
        return workflow.emit('response');
      });
    });

    workflow.emit('checkMIME');
  }
};
