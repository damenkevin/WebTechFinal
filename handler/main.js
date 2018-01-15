
$('#dataTables-leaderboard').DataTable({
    "lengthMenu": [ 10, 25, 50, 75, 100 ],
    "oLanguage": {
        "sLengthMenu": "Show _MENU_"
    },
    columns: [
        {name: 'name', data: 'name'},
        {name: 'points', data:'points'}
    ],
    "aaSorting": [[ 1, "desc" ]]
});

$('#dataTables-user').DataTable({
    "bLengthChange": false,
    "language": {
        "searchPlaceholder": "Search user",
        "search": "_INPUT_"
    },
    columns: [
        {name: 'img', data: 'img'},
        {name: 'name', data: 'name'}
    ],
    "dom": 'ftip'

});

$('#logoutBtn').on('click', function (e) {
    e.preventDefault();
    location.reload();
});
$('#registerContainer').hide();
$('#dashboardContainer').hide();
$('#gameContainer').hide();

$('#gotoregister').on('click', function () {
    goToR();
});





function goToGame() {
    $('#loginContainer').hide('fast', 'linear', function () {
        $('#registerContainer').hide();
        $('#dashboardContainer').show('fast', 'linear');
    });
}

function goToR() {
    $('#loginContainer').hide("fast", "linear", function () {
        $('#registerContainer').show("fast", "linear");
    });
}



