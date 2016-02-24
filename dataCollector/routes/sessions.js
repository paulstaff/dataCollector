var util = require('../util/util.js');

var Sessions = function() {

    this.initiate = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collUsers = db.get(util.COLL_USERS);
        var collSessions = db.get(util.COLL_SESSIONS);

        // Retrieve the specified user object from the database collection
        collUsers.findOne({ 'email': req.body.email, 'password': req.body.password }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else if (result === null) {
                err = util.generateError(util.ERR_INVALID_LOGIN_CREDENTIALS, 400, util.ERR_INVALID_LOGIN_CREDENTIALS);
                res.status(err.error.status).json(err);
            } else {

                // Initiate the session object
                var session = {
                    'userId': result._id,
                    'expiration': Date.now() + 1800000
                };

                // Insert the session into the database collection
                collSessions.insert(session, function(err, result) {
                    if (err) {
                        res.status(err.error.status).json(err);
                    } else {
                        res.status(200).json(util.generateSuccess(result));
                    }
                });
            }
        });
    };

    this.validate = function(req, res, next) {

        // Initialize database and collection variable
        var db = req.db;
        var collSessions = db.get(util.COLL_SESSIONS);

        var sessionId = req.get('sessionId');

        // Retrieve the specified session object from the database collection
        collSessions.findOne({ '_id': sessionId }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else if (result === null) {
                err = util.generateError(util.ERR_INVALID_SESSION_ID, 400, util.ERR_INVALID_SESSION_ID);
                res.status(err.error.status).json(err);
            } else if (Date.now() > result.expiration) {
                err = util.generateError(util.ERR_EXPIRED_SESSION_ID, 400, util.ERR_EXPIRED_SESSION_ID);
                res.status(err.error.status).json(err);
            } else {

                // Initiate the session object
                var session = {
                    '_id': result._id,
                    'userId': result._id,
                    'expiration': Date.now() + 1800000
                };

                // Insert the session into the database collection
                collSessions.findAndModify( { '_id': session._id }, session, function(err, result) {
                    if (err) {
                        res.status(err.error.status).json(err);
                    } else {
                        next();
                    }
                });
            }
        });
    };
};

module.exports = Sessions;