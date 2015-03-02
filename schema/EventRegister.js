'use strict';

exports = module.exports = function(app, mongoose) {
  var EventRegisterSchema = new mongoose.Schema({
    eid: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    uid: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
  });
  EventRegisterSchema.plugin(require('./plugins/pagedFind'));
  EventRegisterSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('EventRegister', EventRegisterSchema);
};
