'use strict';

var mongoose = require('mongoose');

exports = module.exports = function(app, mongoose) {
  var validationsSchema = new mongoose.Schema({
    eid: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
		uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		erid: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegister' },
		isValidate: { type: Boolean }
  });
  validationsSchema.plugin(require('./plugins/pagedFind'));
  validationsSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Validation', validationsSchema);
};