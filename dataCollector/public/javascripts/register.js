
var API_PREFIX = '/api/v1';

$(document).ready(function() {

    // Register user event on button click
    $('#btnRegister').on('click', registerUser);
});

function registerUser() {

    // Initialize variables
    var error = 0;
    var inputEmail = $('#inputEmail').val();
    var inputPassword = $('#inputPassword').val();

    // Validate fields
    if (inputEmail == '') {
        error = 1;
    }

    if (inputPassword == '') {
        error = 1;
    }

    // If no errors, register the user
    if(error == 0) {

        // Create new user variable
        var newUser = {
            'email': inputEmail,
            'password': inputPassword
        };

        // Initiate POST request
        $.ajax({
            type: 'POST',
            data: newUser,
            url: API_PREFIX + '/users',
            dataType: 'JSON'
        }).done(function(response) {
            // if response is good, clear fields and populate table
            if(response.error == null) {
                window.location = ('/frontend/collectorList');
            }
            else {
                // display error
                alert('Error: ' + response.error.displayMsg);
            }
        });
    }
}