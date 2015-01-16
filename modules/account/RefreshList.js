var catTab = {
  'activity': 0,
  'exchange': 1,
  'opportunity': 2
};

exports = module.exports = function(req, res) {
  var date = Date.now(),
  query = {
    $or : [
    { date: { '$gt': date }, type: catTab['activity'] },
    { date: { '$lt': date }, date2: { '$gt': date }, type: catTab['exchange'] }
    ],
    _id: { '$nin': req.body.idsTab || [] },
    accType: req.session.accType,
    latLng: {
      $geoWithin: {
        $centerSphere: [ [ parseFloat(req.body.loc[0]), parseFloat(req.body.loc[1]) ], 10/6371]
      }
    }
  };

  req.app.db.models.Event.find(query).populate('acc').sort('-date').exec(function(err, events) {
    if (err)
      return res.status(400).send(err);
    req.app.db.models.Account.populate(events, { path: 'acc.roles.account' }, function(err, events) {
      if (err)
        return res.status(400).send(err);
      req.app.db.models.Pro.populate(events, { path: 'acc.roles.pro' }, function(err, events) {
        if (err)
          return res.status(400).send(err);
        var eventsList = [];
        require('async').eachSeries(events, function(e, cb) {
          var distance = parseFloat(req.app.modules.maths.CalcDistLatLong(e.latLng, req.body.loc));
          if (e.acc && (distance <= e.visiDistance)) {
            var to_add = {
              'id': e._id,
              'c': e.category,
              't': e.title,
              'd': e.date,
              'd2': e.date2,
              'e': e.desc,
              'a': e.place,
              'p': e.numOfPtc,
              'pp': e.photos,
              'price': e.price,
              'dis': distance,
              'pos': [
              e.latLng[0], //longitude
              e.latLng[1]  //latitude
              ],
              'type': e.type,
              'linked': false,
              'by': {
                'id': e.acc._id,
                'type': (e.accType == 'account' ? 'user' : 'pro'),
                'name': e.acc.roles[e.accType].name.full || e.acc.roles[e.accType].name,
                'pic': e.acc.roles[e.accType].picture
              }
            };
            var find = {};
            find['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
            find['folwd.'+e.accType+'.id'] = e.acc.roles[e.accType]._id;
            req.app.db.models.UserLink.findOne(find).exec(function(err, res) {
              if (res || (e.acc.roles[e.accType]._id == req.user.roles[req.session.accType]._id))
                to_add.linked = true;
              eventsList.push(to_add);
              return cb(null);
            });
          } else {
            return cb(null);
          }
        }, function(err) {
          return res.status(200).send(eventsList);
        });
      });
    });
  });
}
