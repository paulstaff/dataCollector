Data Collection Service Readme
==============================

This service provides an endpoint that receives JSON POST requests and stores the data in a Mongo database.

Models
------

### User Model

``` JSON
    {
        "_id": "eq0gWrD3Q763DxIPMCbJ",
        "email": "user@email.com",
        "password": "testpass"
    }
```

### Collection Service Model

``` JSON
    {
        "_id": "AWePS65cJ8s20ZbzbQIm",
        "name": "User Data Collection",
        "description": "This service collects information about users entered into a form",
        "authenticationToken": "ugtb7bk01V4fy47I5kLV",
        "status": 1,
        "options": {
            "allowExtraneousProperties": 0
        },
        "template": [
            { "property": "username", "type": "text" },
            { "property": "email", "type": "text" },
            { "property": "name", "type": "text" }
        ]
    }
```

### Data Item Model

``` JSON
    {
        "_id": "Y8GX8faD3xkET8JFUURj",
        "serviceId": "AWePS65cJ8s20ZbzbQIm",
        "timestamp": 12398712894,
        "ipAddress": "123.145.167.189",
        "data": {
            "username": "testuser",
            "email": "test@test.come",
            "name": "Test User"
        },
        "extraneousData": {
            "someOtherField": "someOtherData"
        }
    }
```

Service Actions
---------------

* Create new user account
* Log in with existing user account
* Update existing user account
* Create new collection service
* Update existing collection service
* Generate an autorization token for existing service.
* Add data item to existing collection service
* Retrieve data items from existing collection service

API Calls
---------

### Create User


### Log In


### Update User


### Create Collection Service

* This API call creates a new collection service. The system will validate that all required properties are present, generate a new `_id` for the service, and add it to the services collection in the mongo database.

### Generate Authorization Token

* This API call creates a new authorization token for the collection service and inactivates the previously active token (if applicable).

### Udpate Collection Service



### Create Data Item


### Retrieve Data Items








