//create server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//establish port
const PORT = process.env.PORT || 50000;
server.listen(PORT);

//debug port
console.log("server running");
console.log(PORT);

//send the static html file
app.get('/', function(req, res){
    res.sendFile(__dirname + "/index.html");
});

//server static fileds to the server to prevent 404 file not found error
app.use('/style', express.static(__dirname + '/style'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/dist', express.static(__dirname + '/dist'));
app.use('/image-picker-master', express.static(__dirname + '/image-picker-master'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/less', express.static(__dirname + '/less'));
app.use('/vendor', express.static(__dirname + '/vendor'));
app.use('/pages', express.static(__dirname + '/pages'));
app.use('/handler', express.static(__dirname + '/handler'));
app.use('/cards', express.static(__dirname + '/cards'));


//Array that stores online users (note an user is an object)
var onlineUsers = [];
var matches = [];

// connect to db
var mysql = require('mysql');
var dbConfig = {
    host: 'localhost',
    user: 'websolu3_webtech',
    password: 'webtech',
    database: 'websolu3_game'
};

var shuffle = require('shuffle-array');

//handle mysql disconnect
var connection;
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(function(err){
        if(err){
            console.log("Error with db" + err);
            setTimeout(handleDisconnect,2000);
        }
    });

    connection.on('error', function(err){
        console.log('db error' + err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();
function log(name, bool){
    this.name = name;
    this.bool = bool;
}

function InvitationData(originalName, originalId, foundPartner){
    this.originalName = originalName;
    this.originalId = originalId;
    this.foundPartner = foundPartner;
}

function createDeck() {

    var deck = [];
    //hearts
    for(var k  = 2; k < 15 ; k++){
        var newHearts = new card('hearts', k);
        deck.push(newHearts);
    }
    //diamonds
    for(var a  = 2; a < 15 ; a++){
        var newDiamonds = new card('diamonds', a);
        deck.push(newDiamonds);
    }
    //clubs
    for(var s  = 2; s < 15 ; s++){
        var newClubs = new card('clubs', s);
        deck.push(newClubs);
    }
    //spades
    for(var d  = 2; d < 15 ; d++){
        var newSpades = new card('spades', d);
        deck.push(newSpades);
    }
    //jokers
    var jokerBlack = new card("blackJoker", 1000);
    var jokerRed = new card("redJoker", 1000);

    deck.push(jokerBlack);
    deck.push(jokerRed);

    //shuffle deck
    shuffle(deck);
    return deck;
}

function Deck(deckArray){
    this.deckArray = deckArray;
}

function Player1(name, id, deck){
    this.name = name;
    this.id = id;
    this.deck = deck;

}

function Player2(name, id, deck) {
    this.name = name;
    this.id = id;
    this.deck = deck;
}

function Match(player1, player2, stock){
    this.player1 = player1;
    this.player2 = player2;
    this.stock = stock;
}

function card(face, rank){
    // 11 = jack
    // 12 = queen
    // 13 = king
    // 14 = ace
    this.face = face;
    this.rank = rank;
}


io.sockets.on('connection', function(socket){
    console.log("New client connected with id= " + socket.id);
    socket.on("login", function(data){
        var loggedIn = false;

        for(var i = onlineUsers.length - 1; i >= 0 ; i--){
            if(onlineUsers[i].username === data.username && onlineUsers[i].password === data.password){
                loggedIn = true;
            }
        }

        var loginVal;
        if(!loggedIn){
            var loginStat = "SELECT * FROM `users` WHERE username = '" + data.username + "' AND password='" + data.password + "'";
            connection.query(loginStat, function(err, rows){
                if(rows.length == 1){
                    if(rows[0].username === data.username && rows[0].password === data.password){
                        onlineUsers.push(data);
                        console.log("login succesfull");
                        console.log(onlineUsers);
                        loginVal = true;
                        var l = new log(data.username, loginVal);
                        io.to(data.id).emit('loggedin', l);
                        io.emit('onlineUsers', onlineUsers);
                    } else {
                        console.log("Login failed (1)");
                        loginVal = false;
                        io.to(data.id).emit('loggedin', loginVal);
                    }
                } else {
                    console.log("login failed (2)");
                    loginVal = false;
                    io.to(data.id).emit('loggedin', loginVal);
                }
            });
        } else {
            console.log("already logged in");
            var alreadyLoggedin = true;
            io.to(data.id).emit("alreadyUser", alreadyLoggedin);
        }
    });
    socket.on("disconnect", function(data){
        console.log(socket.id+" disconnected");
        for(var j = matches.length -1 ; j >= 0; j--){
            if(matches[j].player1.id == socket.id){
                io.to(socket.id).emit('you win', false);
                io.to(matches[j].player2.id).emit('you win', true);
                matches.splice(j,1);

            } else if (matches[j].player2.id == socket.id) {
                io.to(socket.id).emit('you win', false);
                io.to(matches[j].player1.id).emit('you win', true);
                matches.splice(j,1);
            }
        }

        for(var i = onlineUsers.length - 1 ; i >= 0 ; i--){
            if(onlineUsers[i].id === socket.id){
                onlineUsers.splice(i, 1);

                console.log(onlineUsers);
            }
        }

        for(var j = matches.length - 1; j >= 0 ; j--){
            if(matches[j].player1.id == socket.id || matches[j].player2.id == socket.id){
                matches.splice(j, 1);
            }
        }

        io.emit('onlineUsers', onlineUsers);


    });
    socket.on('addNewUser', function(data){
        var checkUser = "SELECT `username` FROM `users` WHERE `username` = '" + data.username + "'";
        connection.query(checkUser, function(err, results){
            if(results.length == 0){
                if(data.password === data.secPassword){
                    var insert = "INSERT INTO `users` (`username`, `password`, `password_bc`, `email`) VALUES ('"+data.username+"', '"+data.password+"', '"+data.secPassword+"' , '"+ data.email +"')";
                    console.log(insert);
                    connection.query(insert, function(err, res){
                        var setScore = "INSERT INTO `score` (`username`, `points`) VALUES ('"+data.username+"', 0)";
                        connection.query(setScore, function(err, res){
                            console.log("inserted");
                            var msg = true;
                            io.to(data.id).emit("createdNewUser", msg);
                            onlineUsers.push(data);
                            console.log(onlineUsers);
                            io.emit('onlineUsers', onlineUsers);
                        });
                    });
                } else {
                    io.to(data.id).emit('doublePass', false);
                }
            } else {
                // username already taken
                var msg = false;
                io.to(data.id).emit('createdNewUser', msg);
            }
        });

    });
    socket.on('invite', function(data){
        console.log('invi sent');
        var target = data.targetName;
        if(target !== data.currentUsername){
            for(var j = onlineUsers.length -1 ; j >= 0 ; j--){
                if(onlineUsers[j].username === target){
                    //user online
                    var targetId = onlineUsers[j].id;
                    data.idTarget = targetId;
                    var sendData = new InvitationData(data.currentUsername, data.idSelf, true);
                    io.to(data.idTarget).emit('accept', sendData);
                }
            }
        } else {
            io.to(data.idSelf).emit('wrongInv', true);
        }
    });

    socket.on('accepted', function(data){
        var tempDeck = createDeck();
        var newCardDeck = new Deck(tempDeck);
        //created the distributed cards array =
        var deckPlayer1 = [];
        var deckPlayer2 = [];

        var deckArray = newCardDeck.deckArray;

        for(var m = 0; m < deckArray.length ; m++){
            if((m % 2 )== 0){
                deckPlayer1.push(deckArray[m]);

            } else {
                deckPlayer2.push(deckArray[m]);
            }
        }
        var newPlayer1 = new Player1(data.usernameSender, data.idSender, deckPlayer1);
        var newPlayer2 = new Player2(data.usernameTarget, data.idTarget, deckPlayer2);
        var newMatch = new Match(newPlayer1, newPlayer2, [new card(0,'')]);
        if(data.accepted){
            matches.push(newMatch);
            console.log(matches);

            io.to(newPlayer1.id).emit('player1Start', newMatch);
            io.to(newPlayer2.id).emit('player2Start', newMatch);
        }


    });

    socket.on('global', function(data) {
        io.emit('newGlobal', data);
    });

    socket.on('private', function(data){
        var n = data.name;
        console.log(n);
        var targetId;

        for(var m = matches.length-1; m >=0 ; m--){
            if(matches[m].player1.name === n){
                targetId = matches[m].player2.id;
            } else if (matches[m].player2.name === n){
                targetId = matches[m].player1.id;
            }
        }
        console.log(targetId);
        io.to(targetId).emit('newPrivate', data);
        io.to(data.id).emit('newPrivate', data);
    })

    socket.on('1to2', function (data) {
        console.log("do stuff, turn over switching to second player" + data.playedCardIndex);
        var id = data.id;
        var idOponent;
        for(var i =0; i < matches.length ; i++){
            if(matches[i].player1.id === id){
                //console.log(matches[i].player1.deck);
                idOponent = matches[i].player2.id;
                var tempDeck = matches[i].player1.deck;
                var playedCard = tempDeck[data.playedCardIndex];
                var prevCard = matches[i].stock[matches[i].stock.length - 1];
                var win = false;
                //game rules
                if(playedCard.rank >= prevCard.rank && prevCard.rank != 7 && playedCard.rank != 1000 && playedCard.rank != 10 || prevCard.rank === undefined || prevCard.rank == 1000){
                    //passed
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player1.deck.splice(data.playedCardIndex,1);
                    io.to(id).emit('updateCards', matches[i].player1.deck);
                    var decks = matches[i].player2.deck;
                    if(matches[i].player1.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay1', decks);
                        io.to(id).emit('turnPlay1', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else if (prevCard.rank == 7 && playedCard.rank <= prevCard.rank && playedCard.rank != 1000 && playedCard.rank != 10  || prevCard.rank === undefined || prevCard.rank == 1000){
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player1.deck.splice(data.playedCardIndex,1);
                    io.to(id).emit('updateCards', matches[i].player1.deck);
                    var decks = matches[i].player2.deck;

                    if(matches[i].player1.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    }else{
                        io.to(idOponent).emit('turnPlay1', decks);
                        io.to(id).emit('turnPlay1', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }


                } else if (playedCard.rank == 2 && playedCard.rank != 1000 && playedCard.rank != 10 || prevCard.rank === undefined || prevCard.rank == 1000){
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player1.deck.splice(data.playedCardIndex,1);
                    io.to(id).emit('updateCards', matches[i].player1.deck);
                    var decks = matches[i].player2.deck;

                    if(matches[i].player1.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay1', decks);

                        io.to(id).emit('turnPlay1', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else if(playedCard.rank == 1000 && prevCard.rank != 7 || prevCard.rank === undefined || prevCard.rank == 1000){
                    //passed
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player1.deck.splice(data.playedCardIndex,1);
                    io.to(id).emit('updateCards', matches[i].player1.deck);
                    var decks = matches[i].player2.deck;
                    if(matches[i].player1.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        console.log("nog een  keer");
                        io.to(idOponent).emit('turnPlay2', decks);
                        io.to(id).emit('turnPlay2', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else if (playedCard.rank == 10 && prevCard.rank != 7 && playedCard.rank != 1000  || prevCard.rank === undefined || prevCard.rank == 1000){
                    //passed and clear stock;
                    var stock = matches[i].stock;
                    matches[i].player1.deck.splice(data.playedCardIndex,1);
                    stock = [new card(0,'')];
                    matches[i].stock = stock;
                    io.to(id).emit('updateCards', matches[i].player1.deck);
                    var decks = matches[i].player2.deck;
                    if(matches[i].player1.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay2', decks);
                        io.to(id).emit('turnPlay2', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else {
                    io.to(id).emit('cardError', true);
                }

            }
        }
        // console.log(tempDeck);

        //console.log("element= " + element.rank);

    });

    socket.on('2to1', function (data) {
        console.log("do stuff, turn over switching to first player....");
        var id = data.id;
        var idOponent;
        for(var i =0; i < matches.length ; i++) {
            if (matches[i].player2.id === id) {
                idOponent = matches[i].player1.id;
                var tempDeck = matches[i].player2.deck;
                var playedCard = tempDeck[data.playedCardIndex];
                var prevCard = matches[i].stock[matches[i].stock.length - 1];
                var win = false;
                // normal
                //game rules
                if (playedCard.rank >= prevCard.rank && prevCard.rank != 7 && playedCard.rank != 1000 && playedCard.rank != 10  || prevCard.rank === undefined || prevCard.rank == 1000) {
                    //passed
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player2.deck.splice(data.playedCardIndex, 1);
                    io.to(id).emit('updateCards', matches[i].player2.deck);
                    var decks = matches[i].player1.deck;
                    if(matches[i].player2.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay2', decks);
                        io.to(id).emit('turnPlay2', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }


                } else if (prevCard.rank == 7 && playedCard.rank <= prevCard.rank && playedCard.rank != 1000 && playedCard.rank != 10 || prevCard.rank === undefined || prevCard.rank == 1000) {
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player2.deck.splice(data.playedCardIndex, 1);
                    io.to(id).emit('updateCards', matches[i].player2.deck);
                    var decks = matches[i].player1.deck;
                    if(matches[i].player2.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay2', decks);
                        io.to(id).emit('turnPlay2', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else if (playedCard.rank == 2 && playedCard.rank != 1000 && playedCard.rank != 10  || prevCard.rank === undefined || prevCard.rank == 1000) {
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player2.deck.splice(data.playedCardIndex, 1);
                    io.to(id).emit('updateCards', matches[i].player2.deck);
                    var decks = matches[i].player1.deck;
                    if(matches[i].player2.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay2', decks);
                        io.to(id).emit('turnPlay2', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }
                } else if (playedCard.rank == 1000 && prevCard.rank != 7 || prevCard.rank === undefined || prevCard.rank == 1000) {
                    //passed
                    var stock = matches[i].stock;
                    stock.push(playedCard);
                    matches[i].player2.deck.splice(data.playedCardIndex, 1);
                    io.to(id).emit('updateCards', matches[i].player2.deck);
                    var decks = matches[i].player1.deck;
                    if(matches[i].player2.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay1', decks);
                        io.to(id).emit('turnPlay1', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else if (playedCard.rank == 10 && prevCard.rank != 7 && playedCard.rank != 1000 || prevCard.rank === undefined || prevCard.rank == 1000) {
                    //passed and clear stock;
                    var stock = matches[i].stock;
                    matches[i].player2.deck.splice(data.playedCardIndex, 1);
                    stock = [new card(0, '')];
                    matches[i].stock = stock;
                    io.to(id).emit('updateCards', matches[i].player2.deck);
                    var decks = matches[i].player1.deck;
                    if(matches[i].player2.deck.length == 0){
                        win = true;
                        io.to(id).emit('you win', true);
                        //update score
                        io.to(idOponent).emit('you win', false);
                    } else {
                        io.to(idOponent).emit('turnPlay1', decks);
                        io.to(id).emit('turnPlay1', true);
                        io.to(matches[i].player1.id).emit('updateStack', stock);
                        io.to(matches[i].player2.id).emit('updateStack', stock);
                        console.log(stock);
                    }

                } else {
                    console.log("rule error ");
                    io.to(id).emit('cardError', true);
                }
            }
        }
    });

    socket.on('returnStock', function(data){
        for(var i = matches.length -1; i >= 0 ; i-- ){
            if(matches[i].player1.id == data || matches[i].player2.id == data ){
                io.to(data).emit('newStockUpdate', matches[i].stock);
            }
        }
    });

    socket.on('addStockToDeckp2', function(data){
        console.log("try add to stock");
        var pile = data.pile;
        console.log('pile = ' + pile);
        for(var i = matches.length -1 ; i >= 0; i--){
            if(matches[i].player1.id == data.currentId || matches[i].player2.id == data.currentId ){
                console.log('found op');
                console.log('#cards2 :' + matches[i].player2.deck.length);
                console.log("stock ^ " + matches[i].stock);
                for(var j = 1; j < pile.length; j ++){
                    matches[i].player2.deck.push(pile[j]);
                }
                matches[i].stock.splice(1, matches[i].stock.length -1);
                io.to(data.currentId).emit('updateCards', matches[i].player2.deck);
                console.log('#cards2 (update) :' + matches[i].player2.deck.length);
                //console.log('cards ' + matches[i].player2.deck);
                console.log('stock ' + matches[i].stock);
            }
        }
    });

    socket.on('addStockToDeckp1', function(data){
        console.log("try add to stock");
        var pile = data.pile;
        console.log('pile = ' + pile);
        for(var i = matches.length -1 ; i >= 0; i--){
            if(matches[i].player1.id == data.currentId || matches[i].player2.id == data.currentId ){
                console.log('found op');
                console.log('#cards1 :' + matches[i].player1.deck.length);
                console.log("stock ^ " + matches[i].stock);
                for(var j = 1; j < pile.length; j ++){
                    matches[i].player1.deck.push(pile[j]);
                }
                matches[i].stock.splice(1, matches[i].stock.length -1);
                console.log('#cards1 (update) :' + matches[i].player1.deck.length);
                //console.log('cards ' + matches[i].player1.deck);
                console.log('stock ' + matches[i].stock);
                io.to(data.currentId).emit('updateCards', matches[i].player1.deck);
            }
        }
    });

    socket.on('increaseScore', function (data) {
        var upd = "UPDATE `score` SET `points` = `points` + 250 WHERE `username` = '"+data+"'";
        connection.query(upd);
    });

    socket.on('decreaseScore', function (data) {
        var upd = "UPDATE `score` SET `points` = `points` - 250 WHERE `username` = '"+data+"'";
        connection.query(upd);
    });

    socket.on('updateLeaderBoard', function(data){
        if(data){
            console.log('updating leader board');
            var getLB = "SELECT * FROM `score`";
            connection.query(getLB, function(err, results){
                if(!err){
                    console.log("update lb");
                    socket.emit('leaderboardUpdate', results);
                }
            });
        }
    });

    socket.on('giveUp', function(data){
        var id = data;
        for(var j = matches.length -1 ; j >= 0; j--){
            if(matches[j].player1.id == id){
                io.to(id).emit('you win', false);
                io.to(matches[j].player2.id).emit('you win', true);
                matches.splice(j,1);

            } else if (matches[j].player2.id == id) {
                io.to(id).emit('you win', false);
                io.to(matches[j].player1.id).emit('you win', true);
                matches.splice(j,1);
            }
        }
    })
});

