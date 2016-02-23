var util = exports;

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


util.COLL_USERS = 'testUsers';
util.COLL_SESSIONS = 'testSessions';
util.COLL_COLLECTORS = 'testCollectors';
util.COLL_RECORDS = 'testRecords';

util.STATUS_ACTIVE = 1;
util.STATUS_INACTIVE = 0;

util.OPT_TRUE = 1;
util.OPT_FALSE = 0;

util.TEMPLATE_TYPE_TXT = 'text';
util.TEMPLATE_TYPE_INT = 'integer';
util.TEMPLATE_TYPE_DEC = 'decimal';
util.TEMPLATE_TYPE_OBJ = 'object';

util.ERR_INVALID_LOGIN_CREDENTIALS = 'The provided login credentials do not match an existing user. Ensure that the email and password are entered correctly.';
util.ERR_COLLECTOR_DOES_NOT_EXIST = 'The collector requested does not exist. Check that the _id provided is correct.';
util.ERR_INVALID_AUTH_TOKEN = 'The authentication token provided is not valid. Check that the authentication token for your data collector service has not been changed.';
util.ERR_INACTIVE_COLLECTOR = 'The data collector service attempting to be reached is not currently active.';
util.ERR_INVALID_SESSION_ID = 'The provided Session ID is not valid.';
util.ERR_EXPIRED_SESSION_ID = 'The Session ID has expired. Please log in again.';

