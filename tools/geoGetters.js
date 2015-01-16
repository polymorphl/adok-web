exports.init = function(req, res) {
  var ret = {
    a: [],
    g: {
      a: 0,
      e: 0,
      o: 0
    }
  };

  var getActivities = function(callback) {
    req.app.db.models.Aevent.find({date: {'$gt': Date.now()}, accType: req.session.accType, latLng: { $geoWithin: { $centerSphere: [ [ parseFloat(req.query.loc[0]), parseFloat(req.query.loc[1]) ], 10/6371]}}}).populate('acc').sort('-date').exec(function(err, activities) {
      if (err)
        return callback('Error fetching activities.', null);
      require('async').eachSeries(activities, function(activity, callback) {
        req.app.db.models[activity.accType.capitalize()].populate(activity, {path: 'acc.roles.'+activity.accType}, function(err, activity) {
          if (err)
            return callback('Error fetching activities.');
          if (!activity.acc)
            return callback(null, 'done');
          var to_add = {
            'id': activity._id,
            'c': activity.category,
            't': activity.title,
            'd': activity.date,
            'e': activity.desc,
            'a': activity.place,
            'p': activity.numOfPtc,
            'pp': activity.photos,
            'price': activity.price,
            'pos': [
              activity.latLng[0], //longitude
              activity.latLng[1]  //latitude
            ],
            'type': 'activity',
            'linked': false,
            'by': {
              'id': activity.acc._id,
              'type': (activity.accType == 'account' ? 'user' : 'pro'),
              'name': (activity.accType == 'account' ? activity.acc.roles[activity.accType].name.full : activity.acc.roles[activity.accType].name),
              'pic': activity.acc.roles[activity.accType].picture
            }
          };
          if (ret.g.a == 0) {
            ret.g.a = activity._id;
          } else if (activity._id > ret.g.a) {
            ret.g.a = activity._id;
          }
          var find = {};
          find['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
          find['folwd.'+activity.accType+'.id'] = activity.acc.roles[activity.accType]._id;
          req.app.db.models.UserLink.findOne(find).exec(function(err, res) {
            if (res)
              to_add.linked = true;
            ret.a.push(to_add);
            return callback(null);
          });
        });
      }, function(err) {
        if (err)
          return callback(err, null);
        return callback(null, 'done');
      });
    });
  }

  var asyncFinaly = function(err, results) {
    if (err)
      return res.send(400, err);
    ret.a.sort(req.app.utility.dynamicSort("-d"));
    return res.send(200, ret);
  }
  require('async').series([getActivities], asyncFinaly);
}


exports.update = function(req, res) {
  var ret = {
    a: [],
    g: {
      a: 0,
      e: 0,
      o: 0
    }
  };

  var getActivities = function(callback) {
    req.app.db.models.Aevent.find({_id: {'$gt': req.params.a}, date: {'$gt': Date.now()}, accType: req.session.accType}).populate('acc').sort('-date').exec(function(err, activities) {
      if (err)
        return callback('Error fetching activities.', null);
      require('async').eachSeries(activities, function(activity, callback) {
        req.app.db.models[activity.accType.capitalize()].populate(activity, {path: 'acc.roles.'+activity.accType}, function(err, activity) {
          if (err)
            return callback('Error fetching activities.');
          if (!activity.acc)
            return callback(null, 'done');
          var to_add = {
            'id': activity._id,
            'c': activity.category,
            't': activity.title,
            'd': activity.date,
            'e': activity.desc,
            'a': activity.place,
            'p': activity.numOfPtc,
            'pp': activity.photos,
            'price': activity.price,
            'pos': [
              activity.latLng[0], //longitude
              activity.latLng[1]  //latitude
            ],
            'type': 'activity',
            'linked': false,
            'by': {
              'id': activity.acc._id,
              'type': (activity.accType == 'account' ? 'user' : 'pro'),
              'name': (activity.accType == 'account' ? activity.acc.roles[activity.accType].name.full : activity.acc.roles[activity.accType].name),
              'pic': activity.acc.roles[activity.accType].picture
            }
          };
          if (ret.g.a == 0) {
            ret.g.a = activity._id;
          } else if (activity._id > ret.g.a) {
            ret.g.a = activity._id;
          }
          var find = {};
          find['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
          find['folwd.'+activity.accType+'.id'] = activity.acc.roles[activity.accType]._id;
          req.app.db.models.UserLink.findOne(find).exec(function(err, res) {
            if (res)
              to_add.linked = true;
            ret.a.push(to_add);
            return callback(null);
          });
        });
      }, function(err) {
        if (err)
          return callback(err, null);
        return callback(null, 'done');
      });
    });
  }
 
  var asyncFinaly = function(err, results) {
    if (err)
      return res.send(400, err);
    ret.a.sort(req.app.utility.dynamicSort("d"));
    return res.send(200, ret);
  }
  require('async').series([getActivities], asyncFinaly);
}
