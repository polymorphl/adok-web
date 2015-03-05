'use strict';

exports = module.exports = function (app, mongoose) {
	var reportSchema = new mongoose.Schema({
		reportId: {type: Number},
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: '' },
    type: { type: String, default: '' },    
		comments: { type: String, default: '' }
	});
	reportSchema.index({reportId: 1 });
	reportSchema.plugin(require('./plugins/pagedFind'));
	reportSchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('Report', reportSchema);
}