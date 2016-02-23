var util = require('../util/util.js');

var Users = function() {

    this.create = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collUsers = db.get(util.COLL_USERS);

        // Initialize user object
        var user = {
            'email': req.body.email,
            'password': req.body.password,
            'status': util.STATUS_ACTIVE
        };

        // Insert the user object into the database collection
        collUsers.insert(user, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(result);
            }
        });
    };

    this.get = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collUsers = db.get(util.COLL_USERS);

        // Retrieve the specified user object from the database collection
        collUsers.findOne({ '_id': req.params.id }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(result);
            }
        });
    };

    this.update = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collUsers = db.get(util.COLL_USERS);

        // Initialize user object
        var user = {
            '_id': req.params.id,
            'email': req.body.email,
            'password': req.body.password,
            'status': util.STATUS_ACTIVE
        };

        // Set the status of the user
        if (req.body.status == util.STATUS_INACTIVE) {
            user.status = util.STATUS_INACTIVE;
        }

        // Insert the user object into the database collection
        collUsers.findAndModify({ '_id': user._id }, { $set: user }, { 'new': true }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(result);
            }
        });
    };
};

module.exports = Users;