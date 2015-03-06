'use strict';

var mongoose = require('mongoose');

exports.validate = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
  	req.app.db.models.Validations.find({_id: req.params.vid}, function(err, row) {
  		if (row[0].isValidate == true){
  			return workflow.emit('exception', {err: "Vous avez déjà validé."});
  		} else {
		  	req.app.db.models.Validations.update({_id: req.params.vid}, {isValidate: true}, function(err, r) {
	  			return workflow.emit('response');
		  	})
  		}
  	})
  });

  workflow.emit("validate");
};

exports.refuse = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
  	req.app.db.models.Validations.find({_id: req.params.vid}, function(err, row) {
  		if (row[0].isValidate == false){
  			return workflow.emit('exception', {err: "Vous avez déjà refusé."});
  		} else {
		  	req.app.db.models.Validations.update({_id: req.params.vid}, {isValidate: false}, function(err, r) {
	  			return workflow.emit('response');
		  	})
  		}
  	})
  });

  workflow.emit("validate");
};
