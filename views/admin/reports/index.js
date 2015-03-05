'use strict';

exports.read = function  (req, res, next) {
 	req.app.modules.report.ListReport();
}

exports.create = function (req, res, next) {
 	req.app.modules.report.CreateReport();
}

exports.lockAccount = function (req, res, next) {
 	req.app.modules.report.LockAccount();
}

exports.unlockAccount = function (req, res, next) {
	req.app.modules.report.UnlockAccount();
}

exports.delete = function  (req, res, next) {
 	req.app.modules.report.DeleteReport();
}