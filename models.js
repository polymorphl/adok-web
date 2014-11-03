/**
* Models - Schema used for Adok
**/

'use strict';

exports = module.exports = function(app, mongoose) {
  require('./schema/Account')(app, mongoose);
  require('./schema/admin/Admin')(app, mongoose);
  require('./schema/admin/AdminGroup')(app, mongoose);
  require('./schema/Challenge')(app, mongoose);
  require('./schema/Conversation')(app, mongoose);
  require('./schema/Device')(app, mongoose);
  require('./schema/EventRegister')(app, mongoose);
  require('./schema/Message')(app, mongoose);
  require('./schema/admin/Note')(app, mongoose);
  require('./schema/Notifications')(app, mongoose);
  require('./schema/admin/Status')(app, mongoose);
  require('./schema/User')(app, mongoose);
  require('./schema/UserLink')(app, mongoose);
};