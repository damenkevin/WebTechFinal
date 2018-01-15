/**
 * Created by jobde on 21/12/2017.
 */
function render(face, rank, k){
    if(face === 'hearts' && rank >= 2 && rank <= 10){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-"+rank+" hearts'><span id='"+k+"' class='rank'>"+rank+"</span><span id='"+k+"' class='suit'>&hearts;</span></a></li>";
    } else if(face === 'hearts' && rank == 11){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-J hearts'><span id='"+k+"' class='rank'>J</span><span id='"+k+"' class='suit'>&hearts;</span></a></li>";
    } else if(face === 'hearts' && rank == 12){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-q hearts'><span id='"+k+"' class='rank'>Q</span><span id='"+k+"' class='suit'>&hearts;</span></a></li>";
    } else if(face === 'hearts' && rank == 13){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-K hearts'><span id='"+k+"' class='rank'>K</span><span id='"+k+"' class='suit'>&hearts;</span></a></li>";
    } else if(face === 'hearts' && rank == 14){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-A hearts'><span id='"+k+"' class='rank'>A</span><span id='"+k+"' class='suit'>&hearts;</span></a></li>";
    } else if(face === 'diamonds' && rank >=2 && rank <=10){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-"+rank+" diams'><span id='"+k+"' class='rank'>"+rank+"</span><span id='"+k+"' class='suit'>&diams;</span></a></li>";
    } else if(face === 'diamonds' && rank == 11){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-J diams'><span id='"+k+"' class='rank'>J</span><span id='"+k+"' class='suit'>&diams;</span></a></li>";
    } else if(face === 'diamonds' && rank == 12){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-q diams'><span id='"+k+"' class='rank'>Q</span><span id='"+k+"' class='suit'>&diams;</span></a></li>";
    } else if(face === 'diamonds' && rank == 13){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-K diams'><span id='"+k+"' class='rank'>K</span><span id='"+k+"' class='suit'>&diams;</span></a></li>";
    } else if(face === 'diamonds' && rank == 14){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-A diams'><span id='"+k+"' class='rank'>A</span><span id='"+k+"' class='suit'>&diams;</span></label></li>";
    } else if(face === 'clubs' && rank >=2 && rank <=10){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-"+rank+" clubs'><span id='"+k+"' class='rank'>"+rank+"</span><span id='"+k+"' class='suit'>&clubs;</span></a></li>";
    }else if(face === 'clubs' && rank == 11){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-J clubs'><span id='"+k+"' class='rank'>J</span><span id='"+k+"' class='suit'>&clubs;</span></a></li>";
    } else if(face === 'clubs' && rank == 12){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-q clubs'><span  class='rank'>Q</span><span id='"+k+"' class='suit'>&clubs;</span></a></li>";
    } else if(face === 'clubs' && rank == 13){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-K clubs'><span id='"+k+"' class='rank'>K</span><span id='"+k+"' class='suit'>&clubs;</span></a></li>";
    } else if(face === 'clubs' && rank == 14){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-A clubs'><span id='"+k+"' class='rank'>A</span><span id='"+k+"' class='suit'>&clubs;</span></a></li>";
    } else if(face === 'spades' && rank >=2 && rank <=10){
        return "<li id='clicker'><a style='display:block' id='"+k+"' class='card rank-"+rank+" spades'><span id='"+k+"' class='rank'>"+rank+"</span><span id='"+k+"' class='suit'>&spades;</span></a></li>";
    } else if(face === 'spades' && rank == 11){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card rank-J spades'><span id='"+k+"' class='rank'>J</span><span id='"+k+"' class='suit'>&spades;;</span></a></li>";
    } else if(face === 'spades' && rank == 12){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card rank-q spades'><span id='"+k+"' class='rank'>Q</span><span id='"+k+"' class='suit'>&spades;</span></a></li>";
    } else if(face === 'spades' && rank == 13){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card rank-K spades'><span id='"+k+"' class='rank'>K</span><span id='"+k+"' class='suit'>&spades;</span></a></li>";
    } else if(face === 'spades' && rank == 14){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card rank-A spades'><span id='"+k+"' class='rank'>A</span><span id='"+k+"' class='suit'>&spades;</span></a></li>";
    } else if(face === 'blackJoker' && rank == 1000){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card little joker'><span id='"+k+"' class='rank'>-</span><span id='"+k+"' class='suit'>Joker</span></a></li>";
    } else if(face === 'redJoker' && rank == 1000){
        return "<li id='clicker'><a style='display:block' id='"+k+"'  class='card big joker'><span id='"+k+"' class='rank'>-</span><span id='"+k+"' class='suit'>Joker</span></a></li>";
    } else {
        console.log("Rendering issue, please contact the developer");
    }
}
