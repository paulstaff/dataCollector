var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET helloworld page */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello World!' });
});

/* GET userlist page */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e, docs){
        res.render('userlist', {
            "userlist": docs
        })
    });
});

/* GET newuser page */
router.get('/newuser', function(req, res) {
    res.render('newuser', {title: 'Add New User'});
});

/* POST to adduser service */
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

var API_PREFIX = '/api/v1';
var COLLECTION_COLLECTORS = 'testCollectors';


/* POST user - API call to create user */

/* GET user - API call to log user in */

/* PUT user - API call to update user info */

/* Create collector service */
router.post(API_PREFIX + '/collectors', function(req, res) {
    var db = req.db;

    var collection = db.get(COLLECTION_COLLECTORS);

    var collector = {
        'name': req.body.name,
        'description': req.body.description,
        'authToken': '123',
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
    var collection = db.get(COLLECTION_COLLECTORS);

    collection.find({},{},function(e,docs) {
        res.json(docs);
    });
});

/* GET collector - API call to get collector service info */
router.get(API_PREFIX + '/collectors/:id', function(req, res) {
    var db = req.db;
    var collection = db.get(COLLECTION_COLLECTORS);
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

});

/* GET authorization token - API call to generate new authorization token for collector service */
router.get(API_PREFIX + '/collectors/:id/generateAuthToken', function(req, res) {

});

/* POST record - API call to post data record to collector service */
router.post(API_PREFIX + '/collectors/:id/records', function(req, res) {

});

/* GET records - API call to get all records for a collector service */
router.get(API_PREFIX + '/collectors/:id/records', function(req, res) {

});

module.exports = router;