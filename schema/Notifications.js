'use strict';

exports = module.exports = function(app, mongoose) {
  var notifSchema = new mongoose.Schema({
  	type: { type: Number },
  	status: { type: Number, default: 0 },
    from: { 
  		account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
  	},
  	to: { 
  		account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
  	},
    date: { type: Date, default: Date.now },
    event: {
    	challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }
    }
  });
  app.db.model('Notifications', notifSchema);
};