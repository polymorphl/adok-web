adok
=======

	![Adok logo](/public/medias/logo/logo-bg.png)

    Développement de l'application web adok [WEB + ADMIN]

Installation
------------

```bash
$ git clone https://github.com/polymorphl/adok-web.git && cd ./adok
$ npm install
$ bower install
$ grunt
```

Mise en place (Compte administrateur)
-------------------------------------
    Paramètres SMTP : penser a modifier config.js

Pour utiliser le système d'utilisateur, des enregistrements sont necessaires dans la BDD.

Lancer les commandes dans mongo.
```bash
Remplacer:
- ursername: 'root'
- email : 'adresse@email.toto'
```

```js
use adok;
db.admingroups.insert({ _id: 'root', name: 'Lords of adok' });
db.admins.insert({ name: {first: 'Lord', last: 'adok', full: 'Lord adok'}, groups: ['root'] });
var rootAdmin = db.admins.findOne();
db.users.save({ username: 'root', isActive: 'yes', email: 'adresse@email.toto', roles: {admin: rootAdmin._id} });
var rootUser = db.users.findOne();
rootAdmin.user = { id: rootUser._id, name: rootUser.username };
db.admins.save(rootAdmin);
```

Maintenant, utiliser la fonction de redéfinition de mot de passe : 

 - `http://localhost:8000/login/forgot/`
 - Entrer l'adresse e-mail
 - Aller voir sa boite mail et cliquer sur le lien de comfirmation
 - `http://localhost:3000/login/reset/:token/`
 - Définisser un nouveau mot de passe
 - Go sur : `http://localhost:8000/adok-adm/` -- Connexion username - password

TIPS
----

- Lister les process node : 'ps -eaf | grep node';
- Tuer un process particulier : 'kill -9 XXXXX(PROCESS-ID)';

