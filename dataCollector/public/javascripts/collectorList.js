
var API_PREFIX = '/api/v1';

var collectorList = [];

$(document).ready(function() {

    // Validate session and redirect if not valid
    getSession();

    // Retrieve data about collector services
    retrieveCollectors();

    // username link click
    $('#collectorList table tbody').on('click', 'td a.collectorLink', goToCollector);
});

function getSession() {

    var sessionId = jQuery.parseJSON(Cookies.get('session'))._id;

    // Initiate GET request
    $.ajax({
        type: 'GET',
        url: API_PREFIX + '/sessions/',
        dataType: 'JSON',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', sessionId); }
    }).always(function(response) {

        // if API call is successful, set session cookie and redirect
        if(response.error == null) {
            Cookies.set('session', response.response);
        } else {
            window.location = '/frontend/login';
        }
    });
}

function retrieveCollectors() {

    var userId = jQuery.parseJSON(Cookies.get('session')).userId;
    var sessionId = jQuery.parseJSON(Cookies.get('session'))._id;
    console.log('UserId: ' + userId);

    // Initiate GET request
    $.ajax({
        type: 'GET',
        url: API_PREFIX + '/collectors/users/' + userId,
        dataType: 'JSON',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', sessionId); }
    }).always(function(response) {

        // if API call is successful, set session cookie and redirect
        if(response.error == null) {
            console.log(response.response);

            collectorList = response.response;
            var tableContent = '';

            // for each item in JSON, add a table row
            $.each(collectorList, function() {
                tableContent += '<tr>';
                tableContent += '<td><a href="#" class="collectorLink" rel="' + this._id + '">' + this.name + '</a></td>';
                tableContent += '<td>' + this.status + '</td>';
                tableContent += '<td>' + this._id + '</td>';
                tableContent += '<td></td>';
                tableContent += '<td></td>';
                tableContent += '</tr>';
            });

            // inject entire table into HTML page
            $('#collectorList table tbody').html(tableContent);

        } else {
            alert('Error: ' + response.responseJSON.error.displayMsg);
        }
    });

}

function goToCollector(event) {

    // prevent link from firing
    event.preventDefault();

    // retrieve username from link rel attribute
    window.location = '/frontend/collector/' + $(this).attr('rel');
}