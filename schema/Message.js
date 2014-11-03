'use strict';

exports = module.exports = function(app, mongoose) {
  var messageSchema = new mongoose.Schema({
    emet: { type: String },
    dest: { type: String },
    groupId: { type: String },
    time: { type: Date, default: Date.now },
    msg: { type: String, default: '' }
  });
  messageSchema.plugin(require('./plugins/pagedFind'));
  messageSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Message', messageSchema);
};