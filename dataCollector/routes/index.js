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

/* POST user - API call to create user */

/* GET user - API call to log user in */

/* PUT user - API call to update user info */

/* Create collector service */
router.post(API_PREFIX + '/collectors', function(req, res) {
    var db = req.db;

    var collection = db.get(COLL_COLLECTORS);

    var collector = {
        'name': req.body.name,
        'description': req.body.description,
        'authToken': util.generateAuthToken(),
        'status': 1,
        'template': req.body.template
    };

    collection.insert(collector, function(err, result) {
        if(err) {
            res.send('There was an issue creating the collector.');
        } else {
            res.json(result);
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

/* GET collector - API call to get collector service info */
router.get(API_PREFIX + '/collectors/:id', function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);
    var collectorId = req.params.id;

    collection.findOne({ '_id': collectorId }, function(err, result) {
        if(err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

/* PUT collector - API call to update collector service info */
router.put(API_PREFIX + '/collectors/:id', function(req, res) {
    var db = req.db;
    var collection = db.get(COLL_COLLECTORS);

    var collector = {
        '_id': req.params.id,
        'name': req.body.name,
        'description': req.body.description,
        'authToken': req.body.authToken,
        'status': req.body.status,
        'template': req.body.template
    };

    collection.findAndModify({ '_id': collector._id }, collector, { 'new': true }, function(err, result) {
        if(err) {
            res.send('There was an issue modifying the collector.');
        } else {
            res.json(result);
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