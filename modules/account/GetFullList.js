var catTab = {
  'activity': 0
};

exports = module.exports = function(req, res) {
  var date = Date.now(),
  query = {
    $or : [
    { date: { '$gt': date }, type: catTab['activity'] },
    { date: { '$lt': date }, date2: { '$gt': date }, type: catTab['exchange'] }
    ],
    accType: req.session.accType
  };

  req.app.db.models.Event.find(query).populate('acc').sort('-date').exec(function(err, events) {
    if (err)
      return res.status(400).send(err);
    req.app.db.models.Account.populate(events, { path: 'acc.roles.account' }, function(err, events) {
      if (err)
        return res.status(400).send(err);
        var eventsList = [];
        require('async').eachSeries(events, function(e, cb) {
          if (e.acc) {
            var to_add = {
              'id': e._id,
              't': e.title,
              'd': e.date,
              'd2': e.date2,
              'e': e.desc,
              'a': e.place,
              'pp': e.photos,
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
              if (res)
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
}
