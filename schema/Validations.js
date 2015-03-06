'use strict';

var mongoose = require('mongoose');

exports = module.exports = function(app, mongoose) {
  var validationsSchema = new mongoose.Schema({
    e: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
		acc: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
		isValidate: { type: Boolean, default: false },
		picture: { type: String, default: '' }
  });
  validationsSchema.plugin(require('./plugins/pagedFind'));
  validationsSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Validations', validationsSchema);
};