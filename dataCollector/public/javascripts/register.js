
var API_PREFIX = '/api/v1';

$(document).ready(function() {

    // Register user event on button click
    $('#btnRegister').on('click', registerUser);
});

function registerUser(event) {

    // Prevent form from submitting
    event.preventDefault();

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
        }).always(function(response) {

            console.log(response);

            // if API call is successful, set session cookie and redirect
            if(response.error == null) {
                Cookies.set('session', response.response);
                window.location = ('/frontend/collectorList');
            }
            else {
                alert('Error: ' + response.responseJSON.error.displayMsg);
            }
        });
    } else {
        alert('There is an issue with your login information!');
    }
}