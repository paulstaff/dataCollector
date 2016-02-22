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



