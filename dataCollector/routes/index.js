var express = require('express');
var util = require('../util/util.js');
var router = express.Router();

/*
// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET helloworld page
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello World!' });
});

// GET userlist page
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e, docs){
        res.render('userlist', {
            "userlist": docs
        })
    });
});

// GET newuser page
router.get('/newuser', function(req, res) {
    res.render('newuser', {title: 'Add New User'});
});

// POST to adduser service
router.post('/adduser', function(req, res) {

    // Set internal DB
    var db = req.db;

    // Get form values from name attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set collection
    var collection = db.get('usercollection');

    // Insert into the DB
    collection.insert({
        "username": userName,
        "email": userEmail
    }, function (err, doc) {
        if (err) {
            // If insert fails, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // Forward to the success page
            res.redirect("userlist");
        }
    })
});

*/

var API_PREFIX = '/api/v1';
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

/* POST user - API call to create user */

/* GET user - API call to log user in */

/* PUT user - API call to update user info */

// POST collector object - API call to create new collector service
router.post(API_PREFIX + '/collectors', function(req, res) {

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
router.get(API_PREFIX + '/collectors', function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);

    collection.find({},{},function(e,docs) {
        res.json(docs);
    });
});

// GET collector object - API call to get collector service info
router.get(API_PREFIX + '/collectors/:id', function(req, res) {

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
router.put(API_PREFIX + '/collectors/:id', function(req, res) {

    // Initialize database and collection variables
    var db = req.db;
    var collCollectors = db.get(COLL_COLLECTORS);

    // Retrieve the specified collector service object from the database collection
    collCollectors.findOne({ '_id': req.params.id }, function(err, result) {
        if (err) {
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
    });
});

/* GET authorization token - API call to generate new authorization token for collector service */
router.get(API_PREFIX + '/collectors/:id/generateAuthToken', function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);
    var collectorId = req.params.id;

    collection.findAndModify({ '_id': collectorId }, { $set: { 'authToken': util.generateAuthToken() } }, { 'new': true }, function(err, result) {
        if(err) {
            res.send('There was an issue modifying the collector.');
        } else {
            res.json(result);
        }
    });
});

/* POST record - API call to post data record to collector service */
router.post(API_PREFIX + '/collectors/:authToken/records', function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);
    var authToken = req.params.authToken;

    collection.findOne({ 'authToken': authToken }, function(err, result) {
        if(result !== null) {
            var collRecords = db.get(COLL_RECORDS);

            var record = {
                'timestamp': Date.now(),
                'ipAddress': req.ip,
                'collectorId': result._id,
                'data': {},
                'extraFields': {}
            };

            var i;

            for(i = 0; i < result.template.length; i++) {
                record.data[result.template[i].property] = '';
            }

            for(var key in req.body.data) {
                if(record.data.hasOwnProperty(key)) {
                    record.data[key] = req.body.data[key];
                } else {
                    record.extraFields[key] = req.body.data[key];
                }
            }

            collRecords.insert(record, function(err, result) {
                if(err) {
                    res.json(err);
                } else {
                    res.status(200).json(result);
                }
            });
        } else {
            res.send('Invalid authentication token!');
        }
    });

});

/* GET records - API call to get all records for a collector service */
router.get(API_PREFIX + '/collectors/:id/records', function(req, res) {
    var db = req.db;
    var collRecords = db.get(COLL_RECORDS);

    var ObjectID = require('mongodb').ObjectID;

    collRecords.find({ 'collectorId': ObjectID(req.params.id) }, {}, function(err, result) {
        if(err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;