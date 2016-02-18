/**
 * Created by Paul on 2/17/16.
 */

// data array for filling in user data
var userListData = [];

$(document).ready(function() {
    // populate user table on initial page load
    populateTable();

    // username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // add user button
    $('#btnAddUser').on('click', addUser);

    // delete user link
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

// fill table with data
function populateTable() {
    var tableContent = '';

    // AJAX call to retrieve list of users
    $.getJSON('/users/userlist', function(data) {

        userListData = data;

        // for each item in JSON, add a table row
        $.each(data, function() {
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // inject entire table into HTML page
        $('#userList table tbody').html(tableContent);
    });
}

// show user info
function showUserInfo(event) {

    // prevent link from firing
    event.preventDefault();

    // retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // get index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // get user object
    var thisUserObject = userListData[arrayPosition];

    // populate info box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);
}

// add user
function addUser(event) {
    event.preventDefault();

    // basic validation
    var errorCount = 0;

    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    if(errorCount === 0) {

        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        };

        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function(response) {
            // if response is good, clear fields and populate table
            if(response.msg === '') {
                // clear the form inputs
                $('#addUser fieldset input').val('');

                // update the table
                populateTable();
            }
            else {
                // display error
                alert('Error: ' + response.msg);
            }
        })
    }
    else {
        alert("Please fill in all fields!");
        return false;
    }
}

// delete user
function deleteUser(event) {
    event.preventDefault();

    // confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // check confirmation
    if(confirmation === true) {

        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function(response) {
            if(response.msg === '') {

            }
            else {
                alert('Error: ' + response.msg);
            }

            populateTable();
        });
    }
    else {
        return false;
    }
}