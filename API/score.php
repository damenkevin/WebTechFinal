<?php

$db = new mysqli("localhost", "websolu3_webtech", "webtech", "websolu3_game");

if($db->connect_errno){
    echo $db->connect_errno;
    echo "</br>", "<h3>", "failed to connect to the database", "</h3>";
}else{
    //echo "connected";
}

$score = array();

$getScore = "SELECT `username` FROM `score`";
if($res = $db->query($getScore )){
    while($row = $res->fetch_array()) {
        array_push($score, $row);
    }
}

print_r(json_encode($score));


?>


