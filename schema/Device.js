'use strict';

exports = module.exports = function(app, mongoose) {
  var deviceSchema = new mongoose.Schema({
    deviceID: { type: String },
    token: { type: String },
    exp: { type: Date, default: Date.now } // Need to choose exp date
  });
  deviceSchema.plugin(require('./plugins/pagedFind'));
  deviceSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Device', deviceSchema);
};