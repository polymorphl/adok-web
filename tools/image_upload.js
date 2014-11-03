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
      mendqtory: true
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

  if (arr && arr.mime == mime && arr.enabled === true)
    return true;
  return false;
}

exports.init = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
  var options = upload_type[req.params.type];
  var directory = options[req.session.accType].directory;
  var ext = (/([^.;+_]+)$/).exec(req.files.file.originalFilename);
  if (req.body.utype == "edit") {
    return upload[req.params.type](req, res, directory, ext[1], next);
  }
  var header = req.headers;
  
  if (header.referer.length > 0) {
  	var referer = (/http:\/\/.*?\/(.*)\//).exec(header.referer);
    if (options && referer[1] && options[req.session.accType].referer == referer[1] && ext[1] && isFileTypeEnabled(options, ext[1], req.files.file.type)) {
      return upload[req.params.type](req, res, directory, ext[1], next);
    }
  }
  fs.unlink(req.files.file.path);
  return workflow.emit('exception', 'Filetype '+req.files.file.type+' not allowed.')
};

var upload = {
  avatar: function(req, res, directory, ext, next){
    var tmp_path = req.files.file.path;
    var target_path = './uploads/' + directory + req.session.accType + '_' + req.user.roles[req.session.accType]._id +'.'+ ext;
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('checkMIME', function() {
      if (req.files.file.type.split("/")[0] !== "image") {
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
    var tmp_path = req.files.file.path;
    var target_path = './uploads/' + directory + req.body.type + '_' + req.body.id +'.'+ ext;
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('checkMIME', function() {
      if (req.files.file.type.split("/")[0] !== "image") {
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