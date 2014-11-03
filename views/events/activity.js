var moment = require('moment');

exports.init = function(req, res){
	var id = req.params.id;
	var registered;
	var find = {};
	find['event.activity'] = id;
	// find[req.session.accType+'._id'] = req.user.roles[req.session.accType]._id;
	// find['account.account.$.conf'] = 1;
	
	req.app.db.models.Aevent.findById(id, 'acc accType category title photos desc place numOfPtc lat lng date price').populate('acc').exec(function(err, event) {
		if (err || !event)
			return require('../../http/index').http404(req, res);
		res.locals.id = req.user._id;
		res.locals.accType = req.session.accType;
		req.app.db.models[event.accType.capitalize()].populate(event, {path: 'acc.roles.'+event.accType}, function(err, event) {
			req.app.db.models.EventRegister.findOne(find).populate('account._id').populate('pro._id').exec(function(err, ereg) {
				if (err || !event)
					return require('../../http/index').http404(req, res);
				var i = 0;
				while (ereg && ereg[req.session.accType][i]) {
					console.log(ereg[req.session.accType][i]);
					if ([ereg[req.session.accType][i]._id].indexOf(req.user.roles[req.session.accType]._id)) {
						if (ereg[req.session.accType][i].conf == 1)
							registered = true;
						else if (ereg[req.session.accType][i].conf == 2)
							registered = "refused";
						else
							registered = "pending";
						break;
					} else
						i++;
				}
				registered = (registered === undefined ? false : registered);
				var participants = (ereg ? ereg['account'].concat(ereg['pro']) : []);
				var registeredCount = 0;
				i = 0;
				while (participants && participants[i]) {
					if (participants[i].conf == 1)
						++registeredCount;
					++i;
				}
				if (ereg)
					res.render('events/account/activity/index', {event: event, isRegistered: registered, participants: participants, registeredCount: registeredCount});
				else
					res.render('events/account/activity/index', {event: event, isRegistered: registered, participants: [], registeredCount: 0});
			});
		});
	});
}

exports.edit = function(req, res) {
	var outcome = {
    id: '',
    category: '',
    title: '',
    date: '',
    time: '',
    place_value: '',
    place_Lat: '',
    place_Lng: '',
    place: '',
    price: '0',
    numOfPtc: '',
    photos: '',
    desc: ''
	};

	req.app.db.models.Aevent.findById(req.params.id, 'acc accType category title photos desc place numOfPtc lat lng date price').populate('acc').exec(function(err, event) {
		if (err || !event || (event.acc._id.toString() != req.user._id.toString()))
			return require('../../http/index').http404(req, res);
		outcome.id = event._id;
		outcome.category = event.category;
		outcome.title = event.title;
		outcome.date = moment(event.date).format(req.i18n.t('birthdateFormat'));
		outcome.time = moment(event.date).format('HH:mm');
		outcome.place = event.place;
		outcome.place_value = event.place;
		outcome.place_Lat = event.lat;
		outcome.place_Lng = event.lng;
		outcome.price = event.price;
		outcome.numOfPtc = event.numOfPtc;
		outcome.photos = event.photos;
		outcome.desc = event.desc;
		res.render('events/account/activity/edit', {
			event: escape(JSON.stringify(outcome)),
			photo: event.photos
		});
	});
}

exports.update = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
  	if (!req.body.id) {
  		workflow.outcome.errors.push(req.i18n.t('errors.missingId'));
  	}

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
    req.app.db.models.Aevent.findByIdAndUpdate(req.body.id, { $set: fieldsToSet }, function(err, event) {
      if (err)
        return workflow.emit('exception', err);
      workflow.outcome.event = event;
      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
}