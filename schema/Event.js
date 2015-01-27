'use strict';

exports = module.exports = function(app, mongoose) {
  var EventSchema = new mongoose.Schema({
    type: { type: Number, min: 0, max: 2 },
    category: { type: Number },
    title: { type: String, trim: true, default: '' },
    date: { type: Date },
    date2: { type: Date },
    desc: { type: String, default: '' },
    hashtag: { type: String },
    place: { type: String },
    latLng: [ Number ],
    photos: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    acc: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accType: { type: String },
    toNotif: { type: Array },
    datas: { type: Object }
  }, {safe: true});
  EventSchema.plugin(require('./plugins/pagedFind'));
  EventSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Event', EventSchema);
};