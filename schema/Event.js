'use strict';

exports = module.exports = function(app, mongoose) {
  var EventSchema = new mongoose.Schema({
    title: { type: String, trim: true, default: '' },
    desc: { type: String, default: '' },
    hashtag: { type: String },
    place: { type: String },
    latLng: [ Number ],
    photos: { type: String, default: '' },
    start: { type: Date, default: Date.now },
    end: { type: Date},
    acc: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accType: { type: String },
    toNotif: { type: Array },
    datas: { type: Object }
  }, {safe: true});
  EventSchema.plugin(require('./plugins/pagedFind'));
  EventSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Event', EventSchema);
};