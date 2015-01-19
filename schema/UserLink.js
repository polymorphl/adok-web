'use strict';

exports = module.exports = function(app, mongoose) {
	var linkSchema = new mongoose.Schema({
		folwr: {
			account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
		},
		folwd: {
			account: {
				id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
				conf: { type: Number, default: 0 },
				t1: { type: Date, default: Date.now },
				t2: { type: Date }
			}
		}
	});
	// linkSchema.plugin(require('./plugins/pagedFind'));
	linkSchema.set('autoIndex', (app.get('env') === 'development'));
	var model = app.db.model('UserLink', linkSchema);
	linkSchema.post('save', function(doc, next) {
		if (next) {
			var toUnset = {};
		}
	});
};
