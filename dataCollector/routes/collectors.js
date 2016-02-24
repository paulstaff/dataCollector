var util = require('../util/util.js');

var Collectors = function() {

    this.create = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);

        // Initialize the collector object
        var collector = {
            'name': req.body.name,
            'description': req.body.description,
            'authToken': util.generateAuthToken(),
            'status': util.STATUS_ACTIVE,
            'userId': req.body.userId,
            'options': {
                'allowExtraFields': util.OPT_TRUE
            },
            'template': []
        };

        // Set the allowExtraFields option
        if (req.body.options.allowExtraFields == util.OPT_FALSE) {
            collector.options.allowExtraFields = util.OPT_FALSE;
        }

        // Loop through all fields in the template
        for (var i = 0; i < req.body.template.length; i++) {

            // Test that a field name exists and the field type is specified
            if (req.body.template[i].hasOwnProperty('fieldname') &&
                req.body.template[i].fieldname != '' &&
                req.body.template[i].hasOwnProperty('type') && (
                req.body.template[i].type == util.TEMPLATE_TYPE_TXT ||
                req.body.template[i].type == util.TEMPLATE_TYPE_INT ||
                req.body.template[i].type == util.TEMPLATE_TYPE_DEC ||
                req.body.template[i].type == util.TEMPLATE_TYPE_OBJ )) {

                // Push the field into the collector template
                collector.template.push( { 'fieldname': req.body.template[i].fieldname, 'type': req.body.template[i].type } );
            }
        }

        // Insert the collector object into the database collection
        collCollectors.insert(collector, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(util.generateSuccess(result));
            }
        });
    };

    this.retrieve = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);

        // Retrieve the specified collector service object from the database collection
        collCollectors.findOne({ '_id': req.params.id }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(util.generateSuccess(result));
            }
        });
    };

    this.retrieveAll = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);

        // Retrieve the specified collector service object from the database collection
        collCollectors.find({ 'userId': req.params.userId }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(util.generateSuccess(result));
            }
        });
    };

    this.update = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);

        // Retrieve the specified collector service object from the database collection
        collCollectors.findOne({ '_id': req.params.id }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {

                // Check if result is null
                if (result === null) {
                    err = util.generateError(util.ERR_COLLECTOR_DOES_NOT_EXIST, 404, util.ERR_COLLECTOR_DOES_NOT_EXIST);
                    res.status(err.error.status).json(err);
                } else {

                    // Initialize the collector object
                    var collector = {
                        '_id': req.params.id,
                        'name': req.body.name,
                        'description': req.body.description,
                        'authToken': result.authToken,
                        'status': util.STATUS_ACTIVE,
                        'options': {
                            'allowExtraFields': util.OPT_TRUE
                        },
                        'template': []
                    };

                    // Set the status of the collector
                    if (req.body.status == util.STATUS_INACTIVE) {
                        collector.status = util.STATUS_INACTIVE;
                    }

                    // Set the allowExtraFields option
                    if (req.body.options.allowExtraFields == util.OPT_FALSE) {
                        collector.options.allowExtraFields = util.OPT_FALSE;
                    }

                    // Loop through all fields in the template
                    for (var i = 0; i < req.body.template.length; i++) {

                        // Test that a field name exists and the field type is specified
                        if (req.body.template[i].hasOwnProperty('fieldname') &&
                            req.body.template[i].fieldname != '' &&
                            req.body.template[i].hasOwnProperty('type') && (
                            req.body.template[i].type == util.TEMPLATE_TYPE_TXT ||
                            req.body.template[i].type == util.TEMPLATE_TYPE_INT ||
                            req.body.template[i].type == util.TEMPLATE_TYPE_DEC ||
                            req.body.template[i].type == util.TEMPLATE_TYPE_OBJ )) {

                            // Push the field into the collector template
                            collector.template.push( { 'fieldname': req.body.template[i].fieldname, 'type': req.body.template[i].type } );
                        }
                    }

                    // Modify the current document to reflect changes
                    collCollectors.findAndModify({ '_id': collector._id }, collector, { 'new': true }, function(err, result) {
                        if (err) {
                            res.status(err.error.status).json(err);
                        } else {
                            res.status(200).json(util.generateSuccess(result));
                        }
                    });
                }
            }
        });
    };

    this.generateAuthToken = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);

        // Generate and set a new authorization token
        collCollectors.findAndModify({ '_id': req.params.id }, { $set: { 'authToken': util.generateAuthToken() } }, { 'new': true }, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(util.generateSuccess(result));
            }
        });
    };

    this.createRecord = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collCollectors = db.get(util.COLL_COLLECTORS);
        var collRecords = db.get(util.COLL_RECORDS);

        // Find the service associated with the provided authToken
        collCollectors.findOne({ 'authToken': req.params.authToken }, function(err, result) {
            if (result === null) {
                err = util.generateError(util.ERR_INVALID_AUTH_TOKEN, 404, util.ERR_INVALID_AUTH_TOKEN);
                res.status(err.error.status).json(err);
            } else if (result.status == util.STATUS_INACTIVE) {
                err = util.generateError(util.ERR_INACTIVE_COLLECTOR, 404, util.ERR_INACTIVE_COLLECTOR);
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
                if (result.options.allowExtraFields == util.OPT_TRUE) {
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
                    } else if (result.options.allowExtraFields == util.OPT_TRUE) {
                        record.extraFields[key] = req.body.data[key];
                    }
                }

                // Insert the record into the database
                collRecords.insert(record, function(err, result) {
                    if (err) {
                        res.status(err.error.status).json(err);
                    } else {
                        res.status(200).json(util.generateSuccess(result));
                    }
                });
            }
        });
    };

    this.retrieveRecords = function(req, res) {

        // Initialize database and collection variables
        var db = req.db;
        var collRecords = db.get(util.COLL_RECORDS);

        // Include Mongo ObjectID to properly search for the collector service ID in the query
        var ObjectID = require('mongodb').ObjectID;

        // Retrieve all records associated with the collector service
        collRecords.find({ 'collectorId': ObjectID(req.params.id) }, {}, function(err, result) {
            if (err) {
                res.status(err.error.status).json(err);
            } else {
                res.status(200).json(util.generateSuccess(result));
            }
        });
    };



};

module.exports = Collectors;