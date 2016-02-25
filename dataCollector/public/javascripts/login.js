
var API_PREFIX = '/api/v1';

$(document).ready(function() {

    // Register user event on button click
    $('#btnLogin').on('click', loginUser);
});

function loginUser(event) {

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

    // If no errors, initiate session for user
    if(error == 0) {

        // Create user variable
        var user = {
            'email': inputEmail,
            'password': inputPassword
        };

        // Initiate POST request
        $.ajax({
            type: 'POST',
            data: user,
            url: API_PREFIX + '/sessions',
            dataType: 'JSON'
        }).always(function(response) {

            console.log('here');
            console.log(response);

            // if API call is successful, set session cookie and redirect
            if(response.error == null) {
                Cookies.set('session', response.response);
                window.location = '/frontend/collectorList';
            }
            else {
                alert('Error: ' + response.responseJSON.error.displayMsg);
            }
        });
    } else {
        alert('There is an issue with your login information!');
    }
}