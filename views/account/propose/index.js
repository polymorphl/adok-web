'use strict';

var moment = require('moment');

exports.init = function(req, res){
   if (req.isAuthenticated()) {
    res.locals.id = req.user._id;
    res.locals.accType = req.session.accType;
    return res.render('account/propose/index', { contacts: []});
  }
    return res.redirect('/logout/');
};

exports.addActivity = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.title) {
      workflow.outcome.errfor.title = req.i18n.t('errors.required');
    }
    else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
      workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
    }

    var reg = new RegExp(req.i18n.t('dateRegex'));
    if (!req.body.date) {
      workflow.outcome.errfor.date = req.i18n.t('errors.required');
    } else if (!reg.test(req.body.date)) {
      workflow.outcome.errfor.date = req.i18n.t('errors.dateFormat');
    } else if (Date.now() > moment(req.body.date+' '+req.body.time, req.i18n.t('dateFormat')).toDate()) {
      workflow.outcome.errfor.date = req.i18n.t('errors.dateLow');
    }

    if (!req.body.place) {
      workflow.outcome.errfor.place = req.i18n.t('errors.required');
    } else if (!req.body.place_value || !req.body.place_Lng || !req.body.place_Lat) {
      workflow.outcome.errfor.place = req.i18n.t('errors.place');
    }

    if (!req.body.price) {
      workflow.outcome.errfor.price = req.i18n.t('errors.required');
    }

    if (!req.body.numOfPtc) {
      workflow.outcome.errfor.numOfPtc = req.i18n.t('errors.required');
    }

    if (!req.body.desc) {
      workflow.outcome.errfor.desc = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }
    workflow.emit('insertAEvent');
  });

  workflow.on('insertAEvent', function() {
    var fieldsToSet = {
      acc: req.user._id,
      accType: req.session.accType,
      category: req.body.category.trim(),
      title: req.body.title,
      date: moment(req.body.date+' '+req.body.time, req.i18n.t('dateFormat')).toDate(),
      place: req.body.place_value,
      lat: req.body.place_Lat,
      lng: req.body.place_Lng,
      price: req.body.price,
      numOfPtc: req.body.numOfPtc,
      desc: req.body.desc
    };
    req.app.db.models.Aevent.create(fieldsToSet, function(err, event) {
      if (err)
        return workflow.emit('exception', err);
      workflow.outcome.event = event;
      return workflow.emit('response');
    });
  });

  // workflow.on('uploadImage', function() {
  //   var ext = (/([^.;+_]+)$/).exec(req.files.file.originalFilename);
  //   require('../../../tools/image_upload').uploadEvent(req, res, 'aevent', workflow.event._id, ext[1]);
  // });
  workflow.emit('validate');
};

exports.addExchange = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.title) {
      workflow.outcome.errfor.title = req.i18n.t('errors.required');
    }
    else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
      workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
    }

    var reg = new RegExp(req.i18n.t('dateRegex'));
    if (!req.body.date0) {
      workflow.outcome.errfor.date0 = req.i18n.t('errors.required');
    } else if (!reg.test(req.body.date0)) {
      workflow.outcome.errfor.date0 = req.i18n.t('errors.dateFormat');
    } else if (Date.now() > moment(req.body.date0+' '+req.body.time0, req.i18n.t('dateFormat')).toDate()) {
      workflow.outcome.errfor.date0 = req.i18n.t('errors.dateLow');
    }

    if (!req.body.date1) {
      workflow.outcome.errfor.date1 = req.i18n.t('errors.required');
    } else if (!reg.test(req.body.date1)) {
      workflow.outcome.errfor.date1 = req.i18n.t('errors.dateFormat');
    } else if (Date.now() > moment(req.body.date1+' '+req.body.time1, req.i18n.t('dateFormat')).toDate()) {
      workflow.outcome.errfor.date1 = req.i18n.t('errors.dateLow');
    } else if (moment(req.body.date1+' '+req.body.time1, req.i18n.t('dateFormat')).toDate() < moment(req.body.date0+' '+req.body.time0, req.i18n.t('dateFormat')).toDate()) {
      workflow.outcome.errfor.date1 = req.i18n.t('errors.dateInf');
    }

    if (!req.body.place) {
      workflow.outcome.errfor.place = req.i18n.t('errors.required');
    } else if (!req.body.place_value || !req.body.place_Lng || !req.body.place_Lat) {
      workflow.outcome.errfor.place = req.i18n.t('errors.place');
    }

    if (!req.body.price) {
      workflow.outcome.errfor.price = req.i18n.t('errors.required');
    }

    if (!req.body.desc) {
      workflow.outcome.errfor.desc = req.i18n.t('errors.required');
    }

    if (!req.body.photos) {
      workflow.outcome.errfor.photos = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }
    workflow.emit('insertEvent');
  });

  workflow.on('insertEvent', function() {
    var fieldsToSet = {
      acc: req.user._id,
      accType: req.session.accType,
      category: req.body.category.trim(),
      title: req.body.title,
      date0: moment(req.body.date0+' '+req.body.time0, req.i18n.t('dateFormat')).toDate(),
      date1: moment(req.body.date1+' '+req.body.time1, req.i18n.t('dateFormat')).toDate(),
      place: req.body.place_value,
      lat: req.body.place_Lat,
      lng: req.body.place_Lng,
      price: req.body.price,
      troque: (req.body.troque == 'checked' ? true : false),
      desc: req.body.desc
    };
    req.app.db.models.Eevent.create(fieldsToSet, function(err, event) {
      if (err)
        return workflow.emit('exception', err);
      workflow.outcome.event = event;
      return workflow.emit('response');
    });
  });
  workflow.emit('validate');
};
