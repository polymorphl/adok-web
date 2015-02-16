'use strict';

var mongoose = require('mongoose');
var fs = require('fs');

exports = module.exports = function(app, mongoose) {
  var accountSchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      email: { type: String }
    },
    name: {
      first: { type: String, default: '' },
      last: { type: String, default: '' },
      full: { type: String, default: '' }
    },
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },
    devices: {
      deviceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Device'}
    },
    badges: {type: Array},
    isVerified: { type: String, default: '' },
    picture: {type: String, default: ''},
    search: [String],
    verificationToken: { type: String, default: '' }
  });
  accountSchema.plugin(require('./plugins/pagedFind'));
  accountSchema.index({ user: 1 });
  accountSchema.index({ search: 1 });
  accountSchema.set('autoIndex', (app.get('env') === 'development'));
  accountSchema.pre('remove', function(next) {
    app.db.models.User.findById(this.user.id, function(err, account) {
      if (err) {
        console.log(err);
      } else if (!account) {
        return false;
      }
      fs.unlink('.'+this.picture, function(err) {});
      app.db.models.Aevent.remove({accType: 'account', acc: account._id});
      if (!account.roles.pro)
        account.remove();
    });
    next();
  });
  app.db.model('Account', accountSchema);
};
