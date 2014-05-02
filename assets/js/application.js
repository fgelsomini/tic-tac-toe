$(document).ready(function() {

  setTimeout(function() { printWopr('greeting'); },1000);
  setTimeout(function() { printWopr('play'); },2000);
  setTimeout(function() { printPrompt(); },3000);

  function printWopr(message) {
    var row = $('.template .wopr-row');
    var text = $('#' + message).text();
    var textArray = text.split('');
    var counter = 0;
    row.clone().appendTo($('#prompter'));
    (function printText() {
      setTimeout(function() {
        if (counter < textArray.length) {
          $('#prompter .prompter-right').last().attr('data-message-type',message);  
          $('#prompter .prompter-right').last().append(textArray[counter]);  
          counter ++;
          printText();                
        } else {
          $('#prompter .prompter-right').last().append('<br/><br/>');  
        }
      }, 20); 
    })();        
  }

  function printPrompt() {
    var row = $('.template .user-row');
    var cursor = $('.cursor');
    row.clone().appendTo($('#prompter'));
    cursor.clone().appendTo($('#prompter .prompter-right').last());
    messageType = $('#prompter .user-input').closest('#prompter').find('.prompter-right[data-message-type]').last().attr('data-message-type');
    $('#prompter .user-input').last().attr("name", messageType);
    $('#prompter .user-input').last().focus();
    waitForInput();
  }

  function waitForInput() {
    $("#prompter .user-input").keypress(function(e) {
      if(e.which == 13) {
        var responseTo = $('#prompter .user-input').last().attr("name");
        var response = $('#prompter .user-input').last().val();
        handleUserInput(response, responseTo);
      }
    });    
  }

  function handleUserInput(response, responseTo) {
    console.log(responseTo + " " + response)
    switch(responseTo) {
      case("play"):
        pattern = /yes|sure|/g;
        if (pattern.test(response)) {
          clearPrompter();
          setTimeout(function() { printWopr('play-what'); },0);
          setTimeout(function() { printPrompt(); },1000);
        }     
        break;   
      case("play-what"):
        pattern = /tic tac toe|/g
        if (pattern.test(response)) {
          clearPrompter();
          setTimeout(function() { printWopr('players'); },0);
          setTimeout(function() { printPrompt(); },500);
        }     
        break;         
      case("players"):
        pattern = /1|2/g
        if (pattern.test(response)) {
          initializeGame(Number(response));
        }     
        break;                 
      case("again"):
        pattern = /yes|sure|/g
        if (pattern.test(response)) {
          $('#game-grid').hide();
          clearPrompter();
          setTimeout(function() { printWopr('players'); },0);
          setTimeout(function() { printPrompt(); },1000);
        }     
        break;
      default: 
        initializeGame(1);   
        break;
    } 
  }

  function clearPrompter() {
    $('#prompter').removeClass('overlay');
    $('#prompter .wopr-row').remove();
    $('#prompter .user-row').remove();
  }

  // GAME CODE

  var turn;
  var gridSize = 9;

  function initializeGame(players) {
    turn = 1;
    var players = players || 1;
    $('#prompter').removeClass('top-margin');
    clearPrompter();    
    $('#title').text("tic tac toe - " + players + " player game");
    $('#game-message').text("Player " + playerName(players) + " turn");
    drawGrid();
    $('td').click(function() {
      if (turn % 2 === 0) {
        var mark = 'O';
      } else {
        var mark = 'X';
      }
      $(this).text(mark);
      $(this).off('click');
      turn ++;
      $('#game-message').text("Player " + playerName(players) + " turn");      
      checkGameStatus(mark, players);
    });    
  }   

  function playerName() {
    var name;
    if (players == 1) {
      name = turn % 2 === 0 ? 2 : "Computer";      
    } else {
      name = turn % 2 === 0 ? 2 : 1;      
    }
    return name;
  }     

  function drawGrid() {
    var magicSquares = [4,9,2,3,5,7,8,1,6];
    var squareCounter = 0;
    $('tr').each(function() {
      $(this).find('td').each(function() {
        $(this).css("background-color","#000");
        $(this).text("");
        $(this).attr('data-magic-number',magicSquares[squareCounter]);  
        $(this).attr('data-number',squareCounter);   
        $(this).append('<span class="magic-square-number">' + magicSquares[squareCounter] + '</span>');
        squareCounter++;
      }); 
    });    
    $('#game-grid').show();
  }

  function checkGameStatus(mark, players) {
    var winningCombination = checkForWinner(mark);
    if (winningCombination.length > 0) {
      for(var i=0; i<winningCombination.length;i++) {
        console.log(winningCombination[i]);
        var magicSquare = $('td[data-magic-number=' + winningCombination[i] + ']');
        magicSquare.css("background-color", "white");
      }      
      printGameSummary("win");
    } else {
      unplayedCells = getUnplayedCells();
      if (unplayedCells.length > 0) {
        calculateNextMove(mark);
      } else {
        printGameSummary("draw");
      }
    } 
    if (players === 1 && mark === 'X') {
      setTimeout(function() {
        computerTurn();
      },500);
    }    
  }

  function checkForWinner(mark) {
    var winner = false;
    var markedMagicSquares = getPlayedCells(mark);
    var ps = permutate(markedMagicSquares,3);
    for (var i=0;i<ps.length;i++) {
      if (sumArray(ps[i]) === 15) {
        winner = ps[i];
        break;
      }
    }
    return winner;
  }

  function calculateNextMove(mark) {
    var opponentMark = mark === 'X' ? 'O' : 'X';
    var bestPossibleMoves = [];
    var playedCellsPlayer = getPlayedCells(mark);
    var playedCellsOpponent = getPlayedCells(opponentMark);
    var playerCombinations = permutate(playedCellsPlayer,2);
    var opponentCombinations = permutate(playedCellsOpponent,2);
    var unplayedCells = getUnplayedCells();
    // check for center if less than 2 squares have been played
    if (turn < 3 && unplayedCells.indexOf(5) > 0) {
      bestPossibleMoves.push(5);
    } 
    // check for win
    for (var i=0;i<playerCombinations.length;i++) {
      magicSquare = 15 - sumArray(playerCombinations[i]);
      if (unplayedCells.indexOf(magicSquare) > 0) {
        bestPossibleMoves.push(magicSquare);  
      }        
    }
    // check for block
    if (bestPossibleMoves.length === 0) {
      for (var i=0;i<opponentCombinations.length;i++) {
        magicSquare = 15 - sumArray(opponentCombinations[i]);
        if (unplayedCells.indexOf(magicSquare) > 0) {
          bestPossibleMoves.push(magicSquare);
        }        
      }
    }
    // check for open square
    if (bestPossibleMoves.length === 0) {
      bestPossibleMoves = bestPossibleMoves.concat(unplayedCells);
    }      
    return bestPossibleMoves[0];
  }  

  function computerTurn() {
    var bestPossibleMove = calculateNextMove('O');
    $('td[data-magic-number=' + bestPossibleMove + ']').click();
  }

  function getPlayedCells(mark) {
    var markedMagicSquares = [];
    var playedCells = $("td:contains('" + mark + "')");
    playedCells.each(function() { 
      var magicSquare = $(this).attr('data-magic-number');
      markedMagicSquares.push(parseInt(magicSquare));
    });
    return markedMagicSquares.sort();
  }

  function getUnplayedCells() {
    var cells = [];
    var magicSquares = getMagicSquares();
    for (var i=0;i<magicSquares.length;i++) {
      var content = $('td[data-magic-number=' + magicSquares[i] + ']').text();
      if (content !== "X" && content !== "O") {
        cells.push(magicSquares[i]);
      }      
    }
    return cells;
  }

  function getMagicSquares() {
    ms = [];
    $('td').each(function() {
      ms.push(Number($(this).attr('data-magic-number')));
    });  
    return ms;    
  }

  function printGameSummary(status) {
    var player = turn % 2 === 0 ? 1 : 2;    
    $('td').off('click');
    $('#prompter').hide();
    $('#prompter').addClass('top-margin');
    $('#prompter').addClass('overlay');
    setTimeout(function() { $('#prompter').show(); },1000);
    if (status === "win") {
      setTimeout(function() { printWopr('player-' + player + '-wins'); }, 1200);
    } else {
      $('td').css("background-color", "white");
      setTimeout(function() { printWopr('draw'); }, 1200);
    }
    setTimeout(function() { printWopr('again'); }, 2000);
    setTimeout(function() { printPrompt(); },3000);
    waitForInput();    
  }

});
