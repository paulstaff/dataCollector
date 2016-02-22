var util = exports;

// This function generates a new random authentication token
util.generateAuthToken = function() {

    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for (var i = 32; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;

};





