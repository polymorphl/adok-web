'use strict';

exports.sendFeedback = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {

  	if (!req.body.email && !req.body.message) {
  		return res.send({
  			success: false,
				errors: [],
				errfor: {},
				email: '',
				message: ''
  		});
  	}

    if (!req.body.email) {
      workflow.outcome.errfor.email = req.i18n.t('errors.required');
    } else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
      workflow.outcome.errfor.email = req.i18n.t('errors.mailformat');
    }

    if (!req.body.message) {
      workflow.outcome.errfor.message = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('sendEmail');
  });

  workflow.on('sendEmail', function() {
    req.app.utility.sendmail(req, res, {
      from: req.app.get('smtp-from-name') +' <'+ req.app.get('smtp-from-address') +'>',
      replyTo: req.body.email,
      to: req.app.get('system-email'),
      subject: req.app.get('project-name') +' - feedback',
      textPath: 'feedback/email-text',
      htmlPath: 'feedback/email-html',
      locals: {
        email: req.body.email,
        message: req.body.message,
        projectName: req.app.get('project-name')
      },
      success: function(message) {
        workflow.emit('response');
      },
      error: function(err) {
        workflow.outcome.errors.push(req.i18n.t('errors.sending')+ err);
        workflow.emit('response');
      }
    });
  });

  workflow.emit('validate');
};
