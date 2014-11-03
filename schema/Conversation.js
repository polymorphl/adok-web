'use strict';

exports = module.exports = function(app, mongoose) {
  var conversationSchema = new mongoose.Schema({
    user_one: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    user_two: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    ip: { type: String },
    reply: [{
    	user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    	text: { type: String },
    	ip: { type: String },
    	time: { type: Date, default: Date.now }
    }]
  });
  app.db.model('Conversation', conversationSchema);
};
