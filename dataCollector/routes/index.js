var express = require('express');
var util = require('../util/util.js');
var router = express.Router();

var API_PREFIX = '/api/v1';
var COLL_USERS = 'testUsers';
var COLL_SESSIONS = 'testSesssions';
var COLL_COLLECTORS = 'testCollectors';
var COLL_RECORDS = 'testRecords';

var STATUS_ACTIVE = 1;
var STATUS_INACTIVE = 0;

var OPT_TRUE = 1;
var OPT_FALSE = 0;

var TEMPLATE_TYPE_TXT = 'text';
var TEMPLATE_TYPE_INT = 'integer';
var TEMPLATE_TYPE_DEC = 'decimal';
var TEMPLATE_TYPE_OBJ = 'object';

var ERR_INVALID_LOGIN_CREDENTIALS = 'The provided login credentials do not match an existing user. Ensure that the email and password are entered correctly.';
var ERR_COLLECTOR_DOES_NOT_EXIST = 'The collector requested does not exist. Check that the _id provided is correct.';
var ERR_INVALID_AUTH_TOKEN = 'The authentication token provided is not valid. Check that the authentication token for your data collector service has not been changed.';
var ERR_INACTIVE_COLLECTOR = 'The data collector service attempting to be reached is not currently active.';

// POST user - API call to create user
router.post(API_PREFIX + '/users', function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collUsers = db.get(COLL_USERS);

    // Initialize user object
    var user = {
        'email': req.body.email,
        'password': req.body.password,
        'status': STATUS_ACTIVE
    };

    // Insert the user object into the database collection
    collUsers.insert(user, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// GET user - API call to retrieve user info
router.get(API_PREFIX + '/users/:id', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collUsers = db.get(COLL_USERS);

    // Retrieve the specified user object from the database collection
    collUsers.findOne({ '_id': req.params.id }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// PUT user - API call to update user info
router.put(API_PREFIX + '/users/:id', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collUsers = db.get(COLL_USERS);

    // Initialize user object
    var user = {
        '_id': req.params.id,
        'email': req.body.email,
        'password': req.body.password,
        'status': STATUS_ACTIVE
    };

    // Set the status of the user
    if (req.body.status == STATUS_INACTIVE) {
        user.status = STATUS_INACTIVE;
    }

    // Insert the user object into the database collection
    collUsers.findAndModify({ '_id': user._id }, { $set: user }, { 'new': true }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// POST session object - API call to initiate a new session
router.post(API_PREFIX + '/sessions', function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collUsers = db.get(COLL_USERS);
    var collSessions = db.get(COLL_SESSIONS);

    // Retrieve the specified user object from the database collection
    collUsers.findOne({ 'email': req.body.email, 'password': req.body.password }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else if (result === null) {
            err = util.generateError(ERR_INVALID_LOGIN_CREDENTIALS, 400, ERR_INVALID_LOGIN_CREDENTIALS);
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
                    res.status(200).json(result);
                }
            });
        }
    });
});

// POST collector object - API call to create new collector service
router.post(API_PREFIX + '/collectors', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);

    // Initialize the collector object
    var collector = {
        'name': req.body.name,
        'description': req.body.description,
        'authToken': util.generateAuthToken(),
        'status': STATUS_ACTIVE,
        'options': {
            'allowExtraFields': OPT_TRUE
        },
        'template': []
    };

    // Set the allowExtraFields option
    if (req.body.options.allowExtraFields == OPT_FALSE) {
        collector.options.allowExtraFields = OPT_FALSE;
    }

    // Loop through all fields in the template
    for (var i = 0; i < req.body.template.length; i++) {

        // Test that a field name exists and the field type is specified
        if (req.body.template[i].hasOwnProperty('fieldname') &&
                req.body.template[i].fieldname != '' &&
                req.body.template[i].hasOwnProperty('type') && (
                req.body.template[i].type == TEMPLATE_TYPE_TXT ||
                req.body.template[i].type == TEMPLATE_TYPE_INT ||
                req.body.template[i].type == TEMPLATE_TYPE_DEC ||
                req.body.template[i].type == TEMPLATE_TYPE_OBJ )) {

            // Push the field into the collector template
            collector.template.push( { 'fieldname': req.body.template[i].fieldname, 'type': req.body.template[i].type } );
        }
    }

    // Insert the collector object into the database collection
    collCollectors.insert(collector, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    })
});

/* GET collectors - API call to get all collectors TODO: remove this call for production*/
router.get(API_PREFIX + '/collectors', util.validateSession, function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);

    collection.find({},{},function(e,docs) {
        res.json(docs);
    });
});

// GET collector object - API call to get collector service info
router.get(API_PREFIX + '/collectors/:id', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);

    // Retrieve the specified collector service object from the database collection
    collCollectors.findOne({ '_id': req.params.id }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// PUT collector object - API call to update collector service info
router.put(API_PREFIX + '/collectors/:id', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);

    // Retrieve the specified collector service object from the database collection
    collCollectors.findOne({ '_id': req.params.id }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {

            // Check if result is null
            if (result === null) {
                err = util.generateError(ERR_COLLECTOR_DOES_NOT_EXIST, 404, ERR_COLLECTOR_DOES_NOT_EXIST);
                res.status(err.error.status).json(err);
            } else {

                // Initialize the collector object
                var collector = {
                    '_id': req.params.id,
                    'name': req.body.name,
                    'description': req.body.description,
                    'authToken': result.authToken,
                    'status': STATUS_ACTIVE,
                    'options': {
                        'allowExtraFields': OPT_TRUE
                    },
                    'template': []
                };

                // Set the status of the collector
                if (req.body.status == STATUS_INACTIVE) {
                    collector.status = STATUS_INACTIVE;
                }

                // Set the allowExtraFields option
                if (req.body.options.allowExtraFields == OPT_FALSE) {
                    collector.options.allowExtraFields = OPT_FALSE;
                }

                // Loop through all fields in the template
                for (var i = 0; i < req.body.template.length; i++) {

                    // Test that a field name exists and the field type is specified
                    if (req.body.template[i].hasOwnProperty('fieldname') &&
                        req.body.template[i].fieldname != '' &&
                        req.body.template[i].hasOwnProperty('type') && (
                        req.body.template[i].type == TEMPLATE_TYPE_TXT ||
                            req.body.template[i].type == TEMPLATE_TYPE_INT ||
                            req.body.template[i].type == TEMPLATE_TYPE_DEC ||
                            req.body.template[i].type == TEMPLATE_TYPE_OBJ )) {

                        // Push the field into the collector template
                        collector.template.push( { 'fieldname': req.body.template[i].fieldname, 'type': req.body.template[i].type } );
                    }
                }

                // Modify the current document to reflect changes
                collCollectors.findAndModify({ '_id': collector._id }, collector, { 'new': true }, function(err, result) {
                    if (err) {
                        res.status(err.error.status).json(err);
                    } else {
                        res.status(200).json(result);
                    }
                });
            }
        }
    });
});

// GET authorization token - API call to generate new authorization token for collector service
router.get(API_PREFIX + '/collectors/:id/generateAuthToken', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);

    // Generate and set a new authorization token
    collCollectors.findAndModify({ '_id': req.params.id }, { $set: { 'authToken': util.generateAuthToken() } }, { 'new': true }, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// POST record - API call to post data record to collector service
router.post(API_PREFIX + '/collectors/:authToken/records', function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);
    var collRecords = db.get(COLL_RECORDS);

    // Find the service associated with the provided authToken
    collCollectors.findOne({ 'authToken': req.params.authToken }, function(err, result) {
        if (result === null) {
            err = util.generateError(ERR_INVALID_AUTH_TOKEN, 404, ERR_INVALID_AUTH_TOKEN);
            res.status(err.error.status).json(err);
        } else if (result.status == STATUS_INACTIVE) {
            err = util.generateError(ERR_INACTIVE_COLLECTOR, 404, ERR_INACTIVE_COLLECTOR);
            res.status(err.error.status).json(err);
        } else {

            // Initialize the record object
            var record = {
                'timestamp': Date.now(),
                'ipAddress': req.ip,
                'collectorId': result._id,
                'data': {}
            };

            // Add extraFields property if allowExtraFields option is set to true
            if (result.options.allowExtraFields == OPT_TRUE) {
                record.extraFields = {};
            }

            // Loop through template and add all fields to the record data
            for(var i = 0; i < result.template.length; i++) {
                record.data[result.template[i].fieldname] = '';
            }

            // Loop through all data properties in the request
            for(var key in req.body.data) {

                // If the property is part of the template, add to to data, else add to extraFields
                if(record.data.hasOwnProperty(key)) {
                    record.data[key] = req.body.data[key];
                } else if (result.options.allowExtraFields == OPT_TRUE) {
                    record.extraFields[key] = req.body.data[key];
                }
            }

            // Insert the record into the database
            collRecords.insert(record, function(err, result) {
                if (err) {
                    res.status(err.error.status).json(err);
                } else {
                    res.status(200).json(result);
                }
            });
        }
    });
});

/* GET records - API call to get all records for a collector service */
router.get(API_PREFIX + '/collectors/:id/records', util.validateSession, function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collRecords = db.get(COLL_RECORDS);

    // Include Mongo ObjectID to properly search for the collector service ID in the query
    var ObjectID = require('mongodb').ObjectID;

    // Retrieve all records associated with the collector service
    collRecords.find({ 'collectorId': ObjectID(req.params.id) }, {}, function(err, result) {
        if (err) {
            res.status(err.error.status).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

module.exports = router;