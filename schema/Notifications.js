'use strict';

exports = module.exports = function(app, mongoose) {
  var notifSchema = new mongoose.Schema({
    type: { type: Number },
    isRead: { type: Boolean, default: false },
    isAlert: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    typeEvent: { type: String},
    nameUser: {type: String},
    title: {type:String},
    from: {
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
      pro: { type: mongoose.Schema.Types.ObjectId, ref: 'Pro' }
    },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    date: { type: Date, default: Date.now },
    event: {
      event: {type: mongoose.Schema.Types.ObjectId, ref: 'Aevent'},
      network: {title: String, to: String, from: String},
      eventRegister: {idEvent: String, to: String, from: String, msg: String, interaction: Boolean},
    }
  });
  app.db.model('Notification', notifSchema);
};
