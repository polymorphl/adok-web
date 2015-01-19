'use strict';

exports = module.exports = function(app, mongoose) {
  var commentSchema = new mongoose.Schema({
    acc: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    typeEvent: {type: String, default: ''},
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegister' },
    time: { type: Date, default: Date.now },
    comment: { type: String, default: '' }
  });
  app.db.model('Comment', commentSchema);
};
