var mongoose = require('mongoose');

exports.init = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);
	req.app.db.models.Event.findOne( {_id: mongoose.Types.ObjectId(req.headers.eid) }).exec(function(err, row) {
    if (!row)
      workflow.outcome.errors.push("This event does not exist");
    else if (row.acc.toString() != req.user._id.toString())
  		workflow.outcome.errors.push("Account not corresponding");

    if (workflow.hasErrors())
      return workflow.emit('response');

    row.remove(function(err) {
      console.log("EVENT REMOVED WITH SUCCESS".green);
      return workflow.emit('response');
    });
	});
}
