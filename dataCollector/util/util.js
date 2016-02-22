var util = exports;

var COLL_SESSIONS = 'testSesssions';

var ERR_INVALID_SESSION_ID = 'The provided Session ID is not valid.';
var ERR_EXPIRED_SESSION_ID = 'The Session ID has expired. Please log in again.';

// This function generates a new random authentication token
util.generateAuthToken = function() {

    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for (var i = 32; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;

};

util.generateSuccess = function(response) {
    return {
        error: null,
        response: response
    };
};

util.generateError = function(displayMsg, httpStatus, devMsg) {
    return {
        error: {
            displayMsg: displayMsg,
            status: httpStatus,
            devMsg: devMsg
        },
        response: null
    };
};

util.validateSession = function(req, res, next) {

    // Initialize database and collection variable
    var db = req.db;
    var collSessions = db.get(COLL_SESSIONS);

    var sessionId = req.get('sessionId');

    // Retrieve the specified session object from the database collection
    collSessions.findOne({ '_id': sessionId }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else if (result === null) {
            err = util.generateError(ERR_INVALID_SESSION_ID, 400, ERR_INVALID_SESSION_ID);
            res.status(err.error.status).json(err);
        } else if (Date.now() > result.expiration) {
            err = util.generateError(ERR_EXPIRED_SESSION_ID, 400, ERR_EXPIRED_SESSION_ID);
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

