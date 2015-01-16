/**
*
* Recursive module loader used to load a bunch of useful tools.
* Needs walk to work.
*
**/

'use strict';

var walk = require('walk'),
		walker,
		options,
		modules = {};

options = {
	followLinks: false,
	listeners: {
		/* Add each content */
		file: function(root, stat, next) {
			root = root.replace(__dirname, './').replace('//', '/');
			if (root === './')
				return next();
			if (!stat.name.match(/index\.js$/) && stat.name[0] !== '_'){
				var dirname = root.replace('./', '');
				if (!!modules[dirname] === false)
					modules[dirname] = {};
				modules[dirname][stat.name.replace('.js', '')] = require(root+'/'+stat.name);
			}
			next();
		}
	}
};

walker = walk.walkSync(__dirname, options);
module.exports = modules;
