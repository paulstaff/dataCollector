
var API_PREFIX = '/api/v1';

var sessionId = '';
var collector = {};
var collectorRecords = {};

$(document).ready(function() {

    // Validate session and redirect if not valid
    getSession(retrieveCollectorDetails);

    $('#btnEditDetails').on('click', openEditDetails);
    $('#btnEditTemplate').on('click', openEditTemplate);
});

function getSession(callback) {

    // Set sessionId based on stored value
    sessionId = jQuery.parseJSON(Cookies.get('session'))._id;

    // Initiate GET request to verify sessionId
    $.ajax({
        type: 'GET',
        url: API_PREFIX + '/sessions/',
        dataType: 'JSON',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', sessionId); }
    }).always(function(response) {

        // if API call is successful, set session cookie, otherwise redirect to login page
        if(response.error == null) {
            Cookies.set('session', response.response);
            callback();
        } else {
            window.location = '/frontend/login';
        }
    });
}

function retrieveCollectorDetails() {

    // TODO: probably need a better way to do this...
    // Retrieve collectorId from path
    var path = location.pathname.split('/');
    collector._id = path[path.length - 1];

    // Initiate API request to retrieve collector details
    $.ajax({
        type: 'GET',
        url: API_PREFIX + '/collectors/' + collector._id,
        dataType: 'JSON',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', sessionId); }
    }).always(function(response) {
        if(response.error == null) {

            // Set collector object and display the details
            collector = response.response;
            displayCollectorDetails();

            // Retrieve records for the collector
            retrieveRecords();

        } else {
            alert('Error: ' + response.responseJSON.error.displayMsg);
        }
    });

}

function displayCollectorDetails() {

    var collectorDetails = '';

    collectorDetails += '<div><strong>Name: </strong>' + collector.name + '</div>'
    collectorDetails += '<div><strong>Description: </strong>' + collector.description + '</div>'
    collectorDetails += '<div><strong>Status: </strong>' + collector.status + '</div>'
    collectorDetails += '<div><strong>Authentication Token: </strong>' + collector.authToken + '</div>'
    collectorDetails += '<div><strong>Allow Extra Fields: </strong>' + collector.options.allowExtraFields + '</div>'

    $('#collectorDetails').html(collectorDetails);
}

function retrieveRecords() {

    // Initiate API request to retrieve records
    $.ajax({
        type: 'GET',
        url: API_PREFIX + '/collectors/' + collector._id + '/records',
        dataType: 'JSON',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', sessionId); }
    }).always(function(response) {

        // if API call is successful, set session cookie and redirect
        if(response.error == null) {
            console.log(response.response);

            var headers = [];

            $.each(collector.template, function() {
                headers.push(this.fieldname);
            });

            console.log(headers);

            collectorRecords = response.response;

            console.log(collectorRecords);

            var tableHeader = '<tr>';

            tableHeader += '<th>Record ID</th>';
            tableHeader += '<th>Timestamp</th>';
            tableHeader += '<th>IP Address</th>';

            $.each(headers, function() {
                tableHeader += '<th>' + this + '</th>';
            });

            tableHeader += '</tr>';

            $('#recordList table thead').html(tableHeader);

            var tableContent = '';

            // for each item in JSON, add a table row
            $.each(collectorRecords, function(key, record) {
                tableContent += '<tr>';

                tableContent += '<td>' + record._id + '</td>';
                tableContent += '<td>' + record.timestamp + '</td>';
                tableContent += '<td>' + record.ipAddress + '</td>';

                $.each(headers, function() {
                    tableContent += '<td>' + record.data[this] + '</td>';
                });

                tableContent += '</tr>';
            });


            $('#recordList table tbody').html(tableContent);

        } else {
            alert('Error: ' + response.responseJSON.error.displayMsg);
        }
    });
}

function openEditDetails() {

    var title = "Edit Collector Service";

    var content =   '<div class="psModalItem">' +
                    '   <div class="inputItem">' +
                    '       <label>Name:</label>' +
                    '       <input type="text" id="inputName">' +
                    '   </div>' +
                    '   <div class="inputItem">' +
                    '       <label>Description:</label>' +
                    '       <input type="text" id="inputDescription">' +
                    '   </div>' +
                    '   <div class="inputItem">' +
                    '       <input type="checkbox" id="inputAllowExtraFields">' +
                    '       <label>Name:</label>' +
                    '   </div>' +
                    '</div> ' +
                    '<div id="psModalFooter">' +
                    '   <div class="btn" onclick="prepCollectorDetails()">Save</div>' +
                    '   <div class="btn" onclick="psModal.close()">Cancel</div>' +
                    '</div> ';

    var options = {
        width: 800
    };

    psModal.open(title, content, options);

    $('#inputName').val(collector.name);
    $('#inputDescription').val(collector.description);

    if(collector.options.allowExtraFields == 1) {
        $('#inputAllowExtraFields').prop('checked', true);
    } else {
        $('#inputAllowExtraFields').prop('checked', false);
    }
}

function prepCollectorDetails() {

    var error = false;

    var name = $('#inputName').val();
    var description = $('#inputDescription').val();

    if (name == '') {
        error = true;
    }

    if (description == '') {
        error = true;
    }

    if (error == false) {

        collector.name = name;
        collector.description = description;

        if ($('#inputAllowExtraFields').is(':checked')) {
            collector.options.allowExtraFields = 1;
        } else {
            collector.options.allowExtraFields = 0;
        }

        updateCollector(function() {
            psModal.close();
            displayCollectorDetails();
        });
    }

}

function openEditTemplate() {

    var title = "Edit Collector Service";

    var content =   '<div class="psModalItem">';

    $.each(collector.template, function() {

        content += '<div class="templateField">';
        content += '    <div class="inputItem">';
        content += '        <label>Fieldname:</label>';
        content += '        <input type="text" value="' + this.fieldname + '">';
        content += '    <div class="inputItem">';
        content += '        <label>Type:</label>';
        content += generateSelect(['text', 'integer', 'decimal', 'object'], this.type);
        content += '    <div class="inputItem">';
        content += '</div>';

    });

    content += '<div>';
    content += '</div>';
    content += '<div id="psModalFooter">';
    content += '   <div class="btn" onclick="prepCollectorTemplate()">Save</div>';
    content += '   <div class="btn" onclick="psModal.close()">Cancel</div>';
    content += '</div> ';

    var options = {
        width: 800
    };

    psModal.open(title, content, options);
}

function generateSelect(options, selected) {

    var select = '<select>';

    $.each(options, function(key, value) {
        if(value == selected) {
            select += '<option value="' + value + '" selected>' + value + '</option>';
        } else {
            select += '<option value="' + value + '">' + value + '</option>';
        }
    });

    select += '</select>';

    return select;
}

function prepCollectorTemplate() {

    var error = false;

    var name = $('#inputName').val();
    var description = $('#inputDescription').val();

    if (name == '') {
        error = true;
    }

    if (description == '') {
        error = true;
    }

    if (error == false) {

        collector.name = name;
        collector.description = description;

        if ($('#inputAllowExtraFields').is(':checked')) {
            collector.options.allowExtraFields = 1;
        } else {
            collector.options.allowExtraFields = 0;
        }

        updateCollector(function() {
            psModal.close();
            displayCollectorDetails();
        });
    }

}

function updateCollector(callback) {

    console.log("sending data:");
    console.log(JSON.stringify(collector));

    // Initiate GET request
    $.ajax({
        type: 'PUT',
        data: JSON.stringify(collector),
        url: API_PREFIX + '/collectors/' + collector._id,
        dataType: 'JSON',
        contentType: 'application/json',
        beforeSend: function(xhr) { xhr.setRequestHeader('sessionId', jQuery.parseJSON(Cookies.get('session'))._id); }
    }).always(function(response) {

        // if API call is successful, set session cookie and redirect
        if(response.error == null) {
            console.log(response);
            callback();
        } else {
            alert('Error: ' + response.responseJSON.error.displayMsg);
        }
    });
}