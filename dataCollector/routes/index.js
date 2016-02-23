var express = require('express');
var util = require('../util/util.js');
var UserRouter = require('./users.js');
var SessionRouter = require('./sessions.js');
var CollectorRouter = require('./collectors.js');
var router = express.Router();

var API_PREFIX = '/api/v1';

var users = new UserRouter();
var sessions = new SessionRouter();
var collectors = new CollectorRouter();

// POST user - API call to create user
router.post(API_PREFIX + '/users', users.create);

// GET user - API call to retrieve user info
router.get(API_PREFIX + '/users/:id', sessions.validate, users.get);

// PUT user - API call to update user info
router.put(API_PREFIX + '/users/:id', util.validateSession, users.update);

// POST session object - API call to initiate a new session
router.post(API_PREFIX + '/sessions', sessions.initiate);

// POST collector object - API call to create new collector service
router.post(API_PREFIX + '/collectors', util.validateSession, collectors.create);

/* GET collectors - API call to get all collectors TODO: remove this call for production*/
router.get(API_PREFIX + '/collectors', util.validateSession, function(req, res) {
    var db = req.db;
    var collection = db.get(util.COLL_COLLECTORS);

    collection.find({},{},function(e,docs) {
        res.json(docs);
    });
});

// GET collector object - API call to get collector service info
router.get(API_PREFIX + '/collectors/:id', util.validateSession, collectors.retrieve);

// PUT collector object - API call to update collector service info
router.put(API_PREFIX + '/collectors/:id', util.validateSession, collectors.update);

// GET authorization token - API call to generate new authorization token for collector service
router.get(API_PREFIX + '/collectors/:id/generateAuthToken', util.validateSession, collectors.generateAuthToken);

// POST record - API call to post data record to collector service
router.post(API_PREFIX + '/collectors/:authToken/records', collectors.createRecord);

/* GET records - API call to get all records for a collector service */
router.get(API_PREFIX + '/collectors/:id/records', util.validateSession, collectors.retrieveRecords);

module.exports = router;