<?php

$db = new mysqli("localhost", "websolu3_webtech", "webtech", "websolu3_game");

if($db->connect_errno){
    echo $db->connect_errno;
    echo "</br>", "<h3>", "failed to connect to the database", "</h3>";
}else{
    //echo "connected";
}

$users = array();
$score = array();

$getUsers = "SELECT `username` FROM `users`";
if($res = $db->query($getUsers )){
    while($row = $res->fetch_array()) {
        array_push($users, $row);
    }
}

print_r(json_encode($users));


?>


