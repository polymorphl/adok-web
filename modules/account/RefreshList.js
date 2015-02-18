var catTab = {
  'activity': 0
};

exports = module.exports = function(req, res) {
  var date = Date.now(),
  query = {
    _id: { '$nin': req.body.idsTab || [] },
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
              'e': e.desc,
              'a': e.place,
              'pp': e.photos,
              'pos': [
                e.latLng[0], //longitude
                e.latLng[1]  //latitude
              ],
              'linked': false,
              'by': {
                'id': e.acc._id,
                'type': 'user',
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
              console.log("HEY! -> " +to_add);
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
