'use strict';

exports = module.exports = function(app, mongoose) {
  var badgeSchema = new mongoose.Schema({
  	desc: { type: String },
		name:  { type: String },
		title: { type: String }
		//picture: { type: String, default: '' }
  });
  badgeSchema.index({ name: 1 });
  badgeSchema.plugin(require('./plugins/pagedFind'));
  badgeSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Badge', badgeSchema);
};
