'use strict';

exports = module.exports = function(app, mongoose) {
  var challengeSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    desc: {type: String, default: '' },
    place: { type: String, default: '' },
    latLng: [Number],
    date: { type: Date },
    numOfUser: { type: Number },
    hashtags: { type: String, default: ''},
    photos: { type: String, default: '' },
    acc: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    timeCreated: { type: Date, default: Date.now },
  });
  challengeSchema.index({ category: 1 });
  challengeSchema.index({ title: 1 });
  challengeSchema.index({ timeCreated: 1 });
  challengeSchema.plugin(require('./plugins/pagedFind'));
  challengeSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Challenge', challengeSchema);
};
