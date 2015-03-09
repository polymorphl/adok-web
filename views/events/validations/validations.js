'use strict';

var mongoose = require('mongoose');

exports.validate = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
  workflow.outcome.eid = req.params.id;

  workflow.on('validate', function() {
    req.app.db.models.EventRegister.findById(req.params.erid, function(err, er) {
      if (err)
        return workflow.emit('exception', err);
      req.app.db.models.Validation.find({eid: req.params.id, uid: er.uid, erid: req.params.erid}, function(err, valid) {
        if (err)
          return workflow.emit('exception', err);
        if (!valid[0])
          req.app.db.models.Validation.create({eid: req.params.id, uid: er.uid, erid: req.params.erid, isValidate: true}, function(err, rc) {
            if (err)
              return workflow.emit('exception', err);
            req.app.db.models.EventRegister.update({_id: req.params.erid}, {$inc: {"nbVote.positive": 1, "nbVote.negative": 0}}, function(err, s) {
              return workflow.emit('response');
            });
          });
        else if (valid[0].isValidate == false)
          req.app.db.models.Validation.update({eid: req.params.id, uid: er.uid, erid: req.params.erid}, {isValidate: true}, function(err, f) {
            req.app.db.models.EventRegister.update({_id: req.params.erid}, {$inc: {"nbVote.positive": 1, "nbVote.negative": -1}}, function(err, s) {
              return workflow.emit('response');
            });
          });
        else
          return workflow.emit('exception');
      });
    });
  });

  workflow.emit("validate");
};

exports.refuse = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
  workflow.outcome.eid = req.params.id;

  workflow.on('validate', function() {
    req.app.db.models.EventRegister.findById(req.params.erid, function(err, er) {
      if (err)
        return workflow.emit('exception', err);
      req.app.db.models.Validation.find({eid: req.params.id, uid: er.uid, erid: req.params.erid}, function(err, valid) {
        if (err)
          return workflow.emit('exception', err);
        if (!valid[0])
          req.app.db.models.Validation.create({eid: req.params.id, uid: er.uid, erid: req.params.erid, isValidate: false}, function(err, rc) {
            if (err)
              return workflow.emit('exception', err);
            req.app.db.models.EventRegister.update({_id: req.params.erid}, {$inc: {"nbVote.positive": 0, "nbVote.negative": 1}}, function(err, s) {
              return workflow.emit('response');
            });
          });
        else if (valid[0].isValidate == true)
          req.app.db.models.Validation.update({eid: req.params.id, uid: er.uid, erid: req.params.erid}, {isValidate: false}, function(err, f) {
            req.app.db.models.EventRegister.update({_id: req.params.erid}, {$inc: {"nbVote.positive": -1, "nbVote.negative": 1}}, function(err, s) {
              return workflow.emit('response');
            });
          });
        else
          return workflow.emit('exception');
      });
    });
  });

  workflow.emit("validate");
};
