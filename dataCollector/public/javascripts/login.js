
var API_PREFIX = '/api/v1';

function createUser() {

    var error = 0;
    var inputEmail = $('#inputEmail').val();
    var inputPassword = $('#inputPassword').val();

    if (inputEmail == '') {
        error = 1;
    }

    if (inputPassword == '') {
        error = 1;
    }

    if(error == 0) {

        var newUser = {
            'email': inputEmail,
            'password': inputPassword
        };

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