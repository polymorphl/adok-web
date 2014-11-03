/*============================================
=            ADOK - Manage errors            =
============================================*/

'use strict';

exports.http404 = function(req, res){
  res.status(404);
  if (req.xhr) {
    res.send( { error:'Ressource non trouvée.'} );
  }
  else {
    res.render('http/404');
  }
};

exports.http500 = function(err, req, res, next){
  res.status(500);
  if (req.xhr) {
    res.send( {error: 'Fichier introuvable.' } );
  }
  else {
    res.render('http/500', {err: err});
  }
};