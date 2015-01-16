'use strict';

exports = module.exports = function(app, mongoose) {
    var badgeSchema = new mongoose.Schema({
		name:  {type: String},
		title: {type: String},
		desc: {type: String},
    });
    badgeSchema.index({ title: 1 });
    badgeSchema.plugin(require('./plugins/pagedFind'));
    badgeSchema.set('autoIndex', (app.get('env') === 'development'));
    app.db.model('Badge', badgeSchema);
};
