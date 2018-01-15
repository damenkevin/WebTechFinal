$(function(){
    var currentUsername;

    var deckPlayer1 = [];
    var deckPlayer2 = [];

    var player1Turn;
    var player2Turn;

    var pile = [];

    var player;

    var socket = io.connect();
    console.log(socket.io.engine.id);

    function GlobalChatMessage(time, message, name) {
        this.time = time;
        this.message = message;
        this.name = name;
    }

    function PrivateChat(time, message, name, id){
        this.time = time;
        this.message = message;
        this.name = name;
        this.id = id;
    }

    function User(username, password, secPassword, id, email){
        this.username = username;
        this.password = password;
        this.secPassword = secPassword;
        this.id = id;
        this.email = email;
    }

    function loginAttempt(username, password, id){
        this.username = username;
        this.password = password;
        this.id = id;
    }

    function Invitation(targetName, currentUsername, idSelf){
        this.targetName = targetName;
        this.idTarget = "";
        this.currentUsername = currentUsername;
        this.idSelf = idSelf;
    }

    function AcceptedInvite(usernameSender, usernameTarget, idSender, idTarget, accepted){
        this.usernameSender = usernameSender;
        this.usernameTarget = usernameTarget;
        this.idSender = idSender;
        this.idTarget = idTarget;
        this.accepted = accepted;
    }

    function turnPlayer1(id,deck,playedCardIndex){
        this.id = id;
        this.deck = deck;
        this.playedCardIndex = playedCardIndex;
    }

    function turnPlayer2(id,deck,playedCardIndex){
        this.id = id;
        this.deck = deck;
        this.playedCardIndex = playedCardIndex;
    }

    function playCard(index, player){
        if(player == 1 && player1Turn == true && player2Turn == false ){
            // player 1 is submitting
            console.log(index);
            var turn = new turnPlayer1(socket.io.engine.id, deckPlayer1, index);
            socket.emit('1to2', turn);
            //disable(player1Turn, player2Turn, player);

        } else if (player == 2 && player2Turn == true && player1Turn == false){
            console.log(player + player1Turn + player2Turn);
            //player 2 is submitti
            var turn = new turnPlayer2(socket.io.engine.id, deckPlayer2, index);
            socket.emit('2to1', turn);
            //disable(player1Turn, player2Turn, player);

        } else {
            console.log("nope" + player1Turn + " " + player2Turn)
        }
    }

    function disable(player1Turn, player2Turn, player){
        if(player1Turn && player == 1){
            $('#turnNotification').html("It is your turn!");
            $('#disableCards').removeClass('overlay');
        } else if(player1Turn && player == 2) {
            $('#turnNotification').html("Opponent's turn");
            $('#disableCards').addClass('overlay');
        } else if(player2Turn && player == 2){
            $('#turnNotification').html("It is your turn!");
            $('#disableCards').removeClass('overlay');
        } else if(player2Turn && player == 1){
            $('#turnNotification').html("Opponent's turn");
            $('#disableCards').addClass('overlay');
        }
    }

    function drawPile(cardsArray){
        socket.emit('returnStock', socket.io.engine.id);
        var draw;
        console.log('top stock : ' + pile[pile.length - 1].rank);
        for (var i = 0; i < cardsArray.length; i++) {
            var cardRank = cardsArray[i].rank;

            if (cardRank >= pile[pile.length - 1].rank && pile[pile.length - 1].rank != 7 || pile[pile.length - 1].rank == null ) {
                return false;
            } else if (pile[pile.length - 1].rank == 7 && cardRank <= 7 || pile[pile.length - 1].rank == null ) {
                return false;
            } else if (cardRank == 2 || pile[pile.length - 1].rank == null) {
                return false;
            } else if (cardRank == 1000 && pile[pile.length - 1].rank != 7 || pile[pile.length - 1].rank == null) {
                return false;
            } else if (cardRank == 10 && pile[pile.length - 1].rank != 7 || pile[pile.length - 1].rank == null) {
                return false;
            } else {
                draw = true;
            }

        }
        console.log('draw = ' + draw);
        return draw;
    }

    function DrawAll(pile, currentId) {
        this.pile = pile;
        this.currentId = currentId;
    }


    $('#registerBtn').on('click', function(e){
        e.preventDefault();
        var username = $('#username').val();
        var password = $('#password').val();
        var secPassword = $('#secPassword').val();
        var email = $('#email').val();

        var id = socket.io.engine.id;
        if(username !== "" && password !== "" && secPassword !== "" && email !== ""){
            var data = new User(username, password, secPassword, id, email);
            console.log(data);
            socket.emit('addNewUser', data);
        } else {
            alert("Please fill in every field");
        }
    });

    $('#loginBtn').on('click', function(e){
        e.preventDefault();
        var user = $('#loginUser').val();
        var pass = $('#loginPass').val();
        var attemptId = socket.io.engine.id;
        var submitData = new loginAttempt(user, pass, attemptId);
        socket.emit('login', submitData);
    });

    $('#startGameBtn').on('click', function(){

    });

    $('#dataTables-user').on('click', function (e) {
        //console.log("clicked");
        var target = $(e.target);
        if(target.is('span')){
            var targetName = target.attr('id');
            var idSelf = socket.io.engine.id;
            var sendInvite = new Invitation(targetName, currentUsername, idSelf);
            console.log(sendInvite);
            var inv = confirm("Do you want to invite " + targetName);
            if(inv){
                socket.emit('invite', sendInvite);
            }
        }
    });

    $('#btn-chat').on('click', function(e){

        var timeStamp;
        var now = new Date();
        var time = [now.getHours(), now.getMinutes()];
        if(time[1] < 10){
            timeStamp = time[0] + ": 0"+ time[1];
        } else {
            timeStamp = time[0] + ':' + time[1];
        }
        //console.log(timeStamp);

        var message = $('#btn-input').val();
        //console.log(message);

        var m = new GlobalChatMessage(timeStamp, message, currentUsername);
        socket.emit('global', m);


    });

    $('#btn-privateChat').on('click', function(e){

        var now = new Date();
        var timeStamp;
        var time = [now.getHours(), now.getMinutes()];
        if(time[1] < 10){
            timeStamp = time[0] + ": 0"+ time[1];
        } else {
            timeStamp = time[0] + ':' + time[1];
        }

        //console.log(timeStamp);

        var message = $('#btn-privateInput').val();
        //console.log(message);

        var m = new PrivateChat(timeStamp, message, currentUsername, socket.io.engine.id);
        socket.emit('private', m);
    });

    $('#playerHand').on('click', function (e) {
        console.log("clicked");
        var target = $(e.target);
        if(target.is('a')){
            var idClicked = target.attr('id');
            console.log(idClicked);
            playCard(idClicked, player);

        }
    });

    $('#playerHand2').on('click', function (e) {
        console.log("clicked");
        var target = $(e.target);
        if(target.is('a')){
            var idClicked = target.attr('id');
            console.log(idClicked);
            playCard(idClicked, player);

        }
    });

    $('#exitGame').on('click', function(){
        socket.emit('giveUp', socket.io.engine.id);
        $('#gameContainer').hide('fast', 'linear', function(){
            $('#dashboardContainer').show('fast', 'linear');
        });
    });


    socket.on('loggedin', function(data){
        if(data.bool){
            console.log(data);
            currentUsername = data.name;
            $('#usernameTop').html(currentUsername);
            goToGame();
            socket.emit('updateLeaderBoard', true);
        } else {
            alert("sorry you entered the wrong credentials");
            currentUsername = "";
        }
    });

    socket.on('createdNewUser', function (data) {
        if(data){
            console.log(data);
            goToGame();
            socket.emit('updateLeaderBoard', true);
        } else {
            alert("This username is already taken");
        }
    });

    socket.on('doublePass', function(data){
        if(data){
            alert("The two passwords do not match");
        }
    });

    socket.on('onlineUsers', function(data){
        console.log(data);
        $('#dataTables-user').DataTable().clear().draw();
        for(var i = data.length -1 ; i >= 0; i--){
            var r =
                {   "img":  "<span class=\"chat-img pull-left\">\n" +
                    "<img src=\"http://placehold.it/25/55C1E7/fff\" alt=\"User Avatar\" class=\"img-circle\" />\n" +
                    "</span>",
                    "name": "<span id='"+data[i].username +"'>"+data[i].username+"</span>"
                };
            $('#dataTables-user').DataTable().row.add(r).draw();
            r = null;
        }
        socket.emit('updateLeaderBoard', true);


    });

    socket.on('accept', function(data){
        var accepted = false;
        if(data.foundPartner){
            var conformation = confirm(data.originalName + "send you an invitation, do you want to play a game with him?");
            if(conformation){
                console.log("accepted");
                // send to server that you accepted
                accepted = true;
            } else {
                console.log("declined");
                accepted = false;
            }
            var acceptance = new AcceptedInvite(data.originalName, currentUsername, data.originalId, socket.io.engine.id, accepted);
            //console.log(acceptance);
            socket.emit('accepted', acceptance);
        }
    });

    socket.on('player1Start', function(data){
        deckPlayer1 = [];
        console.log("you are player 1 and the match has started");
        console.log(data);
        var tempArray = data.player1.deck;
        for(var q = 0; q < tempArray.length; q++){
            deckPlayer1.push(tempArray[q]);
        }
        console.log(deckPlayer1);
        $('#dashboardContainer').hide('fast', 'linear', function(){
            $('#gameContainer').show('fast', 'linear');
        })

        for(var k =  0; k < deckPlayer1.length; k++){
            $('#playerHand').append(render(deckPlayer1[k].face, deckPlayer1[k].rank, k));
        }
        $('#turnNotification').html("It is your turn!");
        $('#disableCards').removeClass('overlay');
        player1Turn = true;
        player2Turn = false;
        player = 1;
    });

    socket.on('player2Start', function(data){
        deckPlayer2 = [];
        console.log("you are player 2 and the match has started");
        console.log(data);
        var tempArray;
        tempArray = data.player2.deck;
        for(var x = 0; x < tempArray.length; x++){
            deckPlayer2.push(tempArray[x]);
        }
        console.log(deckPlayer2);
        $('#dashboardContainer').hide('fast', 'linear', function(){
            $('#gameContainer').show('fast', 'linear');
        });

        for(var k = 0; k < deckPlayer2.length; k++){
            $('#playerHand').append(render(deckPlayer2[k].face, deckPlayer2[k].rank, k));
        }
        $('#turnNotification').html("Opponent's turn");
        $('#disableCards').addClass('overlay');
        player1Turn = false;
        player2Turn = true;

        player = 2;


    });

    socket.on('newGlobal', function(data){
        $('#globalChatField').append(
            "<span class=\"chat-img pull-left\">\n" +
            "<img src=\"http://placehold.it/50/55C1E7/fff\" alt=\"User Avatar\" class=\"img-circle\" />\n" +
            "</span>"+
            "<li class='left clearfix'>" +
            "<div class='chat-body clearfix'>" +
            "<div class='header'>" +
            "<strong class='primary-font'>"+data.name+"</strong>"+
            "<small class='pull-right text-muted'>" +
            "<i class='fa fa-clock-o fa-fw'></i>"+data.time+
            "</small></div><p>" +
            data.message +
            "</p></div></li>"
        )
    });

    socket.on('newPrivate', function(data){
        $('#inGameChatField').append(
            "<span class=\"chat-img pull-left\">\n" +
            "<img src=\"http://placehold.it/50/55C1E7/fff\" alt=\"User Avatar\" class=\"img-circle\" />\n" +
            "</span>"+
            "<li class='left clearfix'>" +
            "<div class='chat-body clearfix'>" +
            "<div class='header'>" +
            "<strong class='primary-font'>"+data.name+"</strong>"+
            "<small class='pull-right text-muted'>" +
            "<i class='fa fa-clock-o fa-fw'></i>"+data.time+
            "</small></div><p>" +
            data.message +
            "</p></div></li>"
        )
    });

    socket.on('updateCards', function(data){
        $('#playerHand').html("");
        if(data.length > 27){
            for(var i = 0 ; i < 27; i++){
                $('#playerHand').append(render(data[i].face, data[i].rank, i ));
            }
            for(var j = 27 ; j < data.length; j++){
                $('#playerHand2').append(render(data[j].face, data[j].rank, j ));
            }
        } else {
            for (var z = 0; z < data.length; z++) {
                $('#playerHand').append(render(data[z].face, data[z].rank, z));
            }
        }

    });
    //play turn for player 1
    socket.on('turnPlay1', function(data){
        player1Turn = false;
        player2Turn = true;
        disable(player1Turn, player2Turn, player);
    });
    //play turn for player 2
    socket.on('turnPlay2', function(data){
        player1Turn = true;
        player2Turn = false;
        disable(player1Turn, player2Turn, player);
    });

    socket.on('updateStack', function(data){
        //disable(player1Turn, player2Turn, player);
        pile = data;
        $('#stock').html("");
        $('#stock').append(render(data[data.length - 1].face, data[data.length - 1].rank, data.length - 1));
        var c = data.length -1;
        $('#counter').html('Cards on pile: ' + c );
    });

    socket.on('cardError', function(data){
        if(data){
            alert("this card is not allowed");
        }
    });

    socket.on('newStockUpdate', function (data){
        pile = data;
        if(pile.length == 1){
            $('#stock').html("<div class='card back'>*</div>");
        }
        var c = pile.length -1;
        $('#counter').html('Cards on pile: ' + c );
        // console.log('pile' + pile);
    });

    $('#drawStock').on('click', function(){
        //socket.emit('returnStock', socket.io.engine.id);
        console.log('com pile: ' + pile);
        if(player = 1){
            var p1 = new DrawAll(pile, socket.io.engine.id);
            socket.emit('addStockToDeckp1', p1);

        } else if (player = 2){
            var p = new DrawAll(pile, socket.io.engine.id);
            socket.emit('addStockToDeckp2', p);
        }
        socket.emit('returnStock', socket.io.engine.id);
        console.log(pile);
    });

    socket.on('you win', function(data){
        if(data){
            alert('you win');
            socket.emit('increaseScore',currentUsername);
            socket.emit('updateLeaderBoard', true);
            $('#gameContainer').hide('fast', 'linear', function(){
                $('#dashboardContainer').show('fast', 'linear');
            });
        } else {
            alert('you lose');
            socket.emit('decreaseScore', currentUsername);
            socket.emit('updateLeaderBoard', true);
            $('#gameContainer').hide('fast', 'linear', function(){
                $('#dashboardContainer').show('fast', 'linear');
            });
        }
    });

    socket.on('leaderboardUpdate', function(data){
        console.log(data);
        $('#dataTables-leaderboard').DataTable().clear().draw();
        for(var i = data.length -1 ; i >= 0; i--){
            var r =
                {
                    'name': data[i].username,
                    'points' : data[i].points
                };
            $('#dataTables-leaderboard').DataTable().row.add(r).draw();
            r = null;
        }
    });

    socket.on('wrongInv', function (data) {
        if(data){
            alert("cannot invite your self");
        }
    });
});