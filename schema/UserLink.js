'use strict';

exports = module.exports = function(app, mongoose) {
	var linkSchema = new mongoose.Schema({
		folwr: {
			account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    	pro: { type: mongoose.Schema.Types.ObjectId, ref: 'Pro' }
		},
		folwd: {
			account: {
				id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
				conf: { type: Number, default: 0 },
				t1: { type: Date, default: Date.now },
				t2: { type: Date }
			},
    	pro: {
				id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pro' },
				conf: { type: Number},
				t1: { type: Date }
			}
		}
	});
	// linkSchema.plugin(require('./plugins/pagedFind'));
	linkSchema.set('autoIndex', (app.get('env') === 'development'));
	var model = app.db.model('UserLink', linkSchema);
	linkSchema.post('save', function(doc, next) {
		if (next) {
			var toUnset = {};
			// toUnset = 'folwd.'+(doc.folwd.pro.id == undefined ? 'pro' : 'account');
			// model.findOneAndUpdate({_id: doc._id}, {unset: toUnset}, function(err, elem) {
			// 	console.log(elem);
			// 	elem.save();
			// });
		}
	});
};
