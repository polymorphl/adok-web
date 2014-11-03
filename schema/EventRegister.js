'use strict';

exports = module.exports = function(app, mongoose) {
  var EventRegisterSchema = new mongoose.Schema({
    event: {
      challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    },
    account: [{
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
      conf: { type: Number, default: 0 }
    }]
  });
  EventRegisterSchema.plugin(require('./plugins/pagedFind'));
  EventRegisterSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('EventRegister', EventRegisterSchema);
};