// io() is actually not undefined..:
// var socket = io();
var socket = io.connect();

const testingMode = true;

// // to prevent image dragging for imgs that are dynamically declared:
// // register onLoad event
// window.onload = disableDraggingOnLoad;
//
// function disableDraggingOnLoad(e) {
//     let evt = e || window.event,// define event (cross browser)
//         imgs,                   // images collection
//         i;                      // used in local loop
//     // if preventDefault exists, then define onmousedown event handlers
//     console.log('evt: ', evt);
//     if (evt.preventDefault) {
//         // collect all images on the page
//         imgs = document.getElementsByTagName('img');
//         // loop through fetched images
//         for (i = 0; i < imgs.length; i++) {
//             // and define onmousedown event handler/ disable img dragging
//             imgs[i].onmousedown = e => {
//                 e.preventDefault();
//             };
//         }
//     }
// }

// §§ PREVENT IMAGE DRAGGING IN FIREFOX ********************************

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

// MutationObserver for everytime the objects are refilled (on game start and new turns):

// Select the node that will be observed for mutations
const targetNode = document.getElementById("objects");

// Options for the observer (which mutations to observe)
const config = { attributes: false, childList: true, subtree: false };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  let newImages;
  // Use traditional 'for loops' for IE 11
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      // console.log('A child node has been added or removed.');
      newImages = true;
    }
    // else if (mutation.type === 'attributes') {
    //     console.log('The ' + mutation.attributeName + ' attribute was modified.');
    // }
  }
  if (newImages) {
    // collect all images on the page
    let imgs = targetNode.getElementsByTagName("img");
    for (let i = 0; i < imgs.length; i++) {
      // and define onmousedown event handler / disable img dragging:
      // console.log('onmousedown event handler is defined for ', imgs[i]);
      imgs[i].onmousedown = e => {
        e.preventDefault();
      };
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// §§ ELEMENTS & GLOBAL VARIABLES ********************************
let iGotDisconnected = false;
const $objects = $("#objects");
const $queue = $("#queue");
const $joinedPlayersContainer = $("#joined-players");
const $rounds = $("#rounds");

const $constructionArea = $("#construction-area");
const $message = $("#construction-area").find(".message");
const $instructions = $("#instructions");

let [borderTop, borderBottom, borderLeft, borderRight] = get$objBorders(
  $constructionArea
);
let viewportWidth = window.innerWidth;

const selectPlayersContainer = document.getElementById("select-players");
const playButton = document.getElementById("play");

// object ticker on start menu:
const objObj = [
  {
    name: "banana",
    images: "banana.png",
    sound: "405705__apinasaundi__found-matress-hit.wav"
  },
  {
    name: "bridge",
    images: ["bridge_v1.png", "bridge_v2.png", "bridge_v3.png"],
    sound: "146981__jwmalahy__thud1.wav"
  },
  {
    name: "cloth",
    images: ["cloth_v1.png", "cloth_v2.png", "cloth_v3.png"],
    sound: "128156__killpineapple__bagoffhead.mp3"
  },
  {
    name: "coin",
    images: ["coin_v1.png", "coin_v2.png"],
    sound: "140722__j1987__metalimpact-4.wav"
  },
  {
    name: "flower",
    images: ["flower_v1.png", "flower_v2.png"],
    sound: "240784__f4ngy__picking-flower.wav"
  },
  {
    name: "fur",
    images: "fur.png",
    sound: "128156__killpineapple__bagoffhead.mp3"
  },
  {
    name: "giant",
    images: ["giant_v1.png", "giant_v2.png", "giant_v3.png"],
    sound: "2516__jonnay__dropsine.wav"
  },
  {
    name: "peg",
    images: ["peg_v1.png", "peg_v2.png"],
    sound: "61086__andre-nascimento__floppy-disk01.wav"
  },
  {
    name: "pig",
    images: ["pig_v1.png", "pig_v2.png", "pig_v3.png"],
    sound: "442907__qubodup__pig-grunt.wav"
  },
  {
    name: "plane",
    images: ["plane_v1.png", "plane_v2.png", "plane_v3.png"],
    sound: "61086__andre-nascimento__floppy-disk01.wav"
  },
  {
    name: "pokerchip",
    images: "pokerchip.png",
    sound: "157539__nenadsimic__click.wav"
  },
  {
    name: "pole",
    images: "pole.png",
    sound: "61081__andre-nascimento__pen-on-floor02.wav"
  },
  {
    name: "puzzle",
    images: ["puzzle_v1.png", "puzzle_v2.png"],
    sound: "220018__chocktaw__fiji-meow-02.wav"
  },
  {
    name: "ring",
    images: ["ring_v1.png", "ring_v2.png"],
    sound: "218823__djtiii__staple-drop.wav"
  },
  {
    name: "rummikubtile",
    images: "rummikubtile.png",
    sound: "157539__nenadsimic__click.wav"
  },
  {
    name: "scissors",
    images: "scissors.png",
    sound: "48641__ohnoimdead__onid-scissor-snap.wav"
  },
  {
    name: "stone",
    images: "stone.png",
    sound: "146981__jwmalahy__thud1.wav"
  },
  {
    name: "ticket",
    images: "ticket.png",
    sound: "157539__nenadsimic__click.wav"
  },
  {
    name: "token",
    images: ["token_v1.png", "token_v2.png"],
    sound: "2516__jonnay__dropsine.wav"
  },
  {
    name: "triangle",
    images: "triangle.png",
    sound: "157539__nenadsimic__click.wav"
  }
];
const objects = document.getElementById("ticker-objects");
let objectList = objects.getElementsByClassName("img-box"); //objectList[0] is always the first link in the list.. list stays in sync

// let left = objects.offsetLeft; //number (in px), x-position of element relative to its parent
// transform px units in vw units:
let left = (objects.offsetLeft * 100) / viewportWidth;

let myReq;

// card deck: ----------------------------------
let cardTitle = document.getElementsByClassName("cardtitle");
let items = document.getElementsByClassName("item");

// §§ GAME/PLAYER STATE: --------------------------
let mySocketId;
let chosenLanguage = "english";
let gameStarted = false;
let itsMyTurn = false;
let numberOfTurns;
let players = [];
let playerNames = {};
let activePlayer;

let gameMaster;
let iAmTheGameMaster = false;

let selectedPieceId = sessionStorage.getItem("selectedPieceId");
let myPlayerName = sessionStorage.getItem("myPlayerName");
let myTotalPoints = parseInt(sessionStorage.getItem("myTotalPoints"), 10);

let doneBtnPressed = false;
let everyoneGuessed = false;
let myGuess;
let correctAnswer;

let dataForNextTurn;

// let playersObj = {};
// players will later be an object like this:
// let playersObj = {
//     "pieceId": {
//         name: "Bob",
//         totalPoints: 8,
//         guessedAnswer: 2
//     }
// };
// if (sessionStorage.getItem("playersObj")) {
//     playersObj = sessionStorage.getItem("playersObj");
// }

// §§ GLOBAL VARIABLES for moving/drag&drop objects: --------------------------
let objectClicked = false;
let objectMoved = false;
let $clickedImgBox;
let $clickedImgId;

let startX;
let startY;
let moveX;
let moveY;

let moveXvw;
let moveYvw;
// let ignoreX = 0;
// let ignoreY = 0;
let translateX;
let translateY;

let transformRotate = 0;

// §§ SOUNDS: --------------------------
const ringDropSound = new Audio("./sounds/218823__djtiii__staple-drop.wav");
const universalDropSound = new Audio("./sounds/157539__nenadsimic__click.wav");
const startGong = new Audio("./sounds/56240__q-k__gong-center-clear.wav");
const doneGong = new Audio("./sounds/434627__dr-macak__ding.wav");
const successJingle = new Audio(
  "./sounds/270404__littlerobotsoundfactory__jingle-achievement-00.wav"
);
const drumroll = new Audio("./sounds/12896__harri__circus-short.mp3");
const bubblePop1 = new Audio("./sounds/422813__pinto0lucas__bubble-low.wav");
const plop = new Audio("./sounds/431671__pellepyb__b1.ogg");

let uniSound = true;
let muted = false;

// §§ PREPARATION ************************************************

shuffleObjects(objects);
moveTickerObjects();
preloadObjectImages();

// §§ EVENT LISTENERS: *******************************************

playButton.addEventListener("click", function() {
  // e.preventDefault();
  if (gameStarted) {
    setTimeout(() => {
      window.alert("game has already started, please try again later");
    }, 200);
  } else if (!selectedPieceId) {
    let msg = "please pick a color before you start the game.";
    window.alert(msg);
    // do something prettier instead of the alert
  } else if (players.length < 3) {
    let msg =
      "minimum number of players is 3. \nwait for more players to join the game";
    window.alert(msg);
    // do something prettier instead of the alert
  } else {
    startGame();
  }
});

$("#start-menu").on("click", ".player", e => {
  // console.log('e.target: ', e.target);
  // console.log('e.currentTarget: ', e.currentTarget);
  // console.log('clicked select players');
  if ($(e.target).hasClass("selectedPlayerPiece")) {
    console.log("clicked element is already taken!");
  }
  // if you haven't yet selected a piece and it's not taken by another player:
  // console.log("your selectedPieceId before clicking: ", selectedPieceId);
  if (!selectedPieceId && !$(e.target).hasClass("selectedPlayerPiece")) {
    let pieceId = $(e.target).attr("id");
    // console.log('$(e.target).attr("id") l269: ', $(e.target).attr("id"));
    // console.log("selectedPieceId l271: ", selectedPieceId);
    selectedPiece(pieceId);
  }
});

$("#chosen-language").on("click", e => {
  if (iAmTheGameMaster) {
    changeLanguage();
  }
});

// §§ event listeners - main game ---------------------------------
window.addEventListener("resize", () => {
  [borderTop, borderBottom, borderLeft, borderRight] = get$objBorders(
    $constructionArea
  );
  viewportWidth = window.innerWidth;
  // unset absolute position of objects to make them readjust to new objects container size and then go back to position absolute with getObjectPositions():
  // $objects.children(".img-box").css({
  //   position: "unset"
  // });
  // getObjectPositions();
});

// touch events:
$("img").on("contextmenu", e => {
  e.preventDefault();
});

$(".wordcard").on("contextmenu", e => {
  e.preventDefault();
});

$("#construction-area").on("contextmenu", e => {
  e.preventDefault();
});

let touch = true;
$(document).on("touchstart", ".img-box", e => {
  handleMouseDown(e, touch);
});

$(document).on("touchmove", e => {
  handleMouseMove(e, touch);
});

$(document).on("touchend", e => {
  handleMouseUp(e, touch);
});

// mouse events:
$(document).on("mousedown", ".img-box", handleMouseDown);

$(document).on("mousemove", handleMouseMove);

$(document).on("mouseup", handleMouseUp);

// key & mouse & touch events:
// toggle sound / mute / discard used objects and refill:
$(document).on("keydown", e => {
  if (e.keyCode == 83) {
    // = "S"
    if (uniSound) {
      ringDropSound.play();
      uniSound = false;
    } else {
      universalDropSound.play();
      uniSound = true;
    }
  } else if (e.keyCode == 77) {
    // = "M"
    if (muted) {
      muted = false;
      $("#muted").addClass("hidden");
      $("#sound-on").removeClass("hidden");
      setTimeout(() => {
        $("#sound-on").addClass("hidden");
      }, 2000);
      if (uniSound) {
        universalDropSound.play();
      } else {
        ringDropSound.play();
      }
    } else {
      muted = true;
      $("#sound-on").addClass("hidden");
      $("#muted").removeClass("hidden");
    }
  } else if (e.keyCode == 13) {
    // = "ENTER"
    if (itsMyTurn) {
      clickedDoneBuilding();
    }
  } else if (e.keyCode == 32) {
    // = "SPACE"
    // do something..
  } else if (e.keyCode == 70) {
    // = "F"
    // simulate "game end":
    if (testingMode && iAmTheGameMaster) {
      endGame();
    }
  } else if (e.keyCode == 81) {
    // = "Q"
    if (itsMyTurn) {
      rotateObject("clockwise");
    }
  } else if (e.keyCode == 69) {
    // = "E"
    if (itsMyTurn) {
      rotateObject("counterclockwise");
    }
  }
});

$(document).on("dblclick", ".img-box", e => {
  if (gameStarted && itsMyTurn && !doneBtnPressed) {
    let imgBox = e.currentTarget;
    changeObjectImage(imgBox);
    // moveObjects();
  }
});

$("#card-points").on("mousedown", ".table-row", function(e) {
  if (!itsMyTurn) {
    guessWordFromCard(e);
  }
});
// FIXED: a player reconnecting during discussion time, couldn't make a guess in the next turn (but after a reconnecting again in that turn he could)
// --> it was because everything inside #card-points" gets replaced on reconnection, including the event listener in a nested html element.

$("#done-btn").on("click", clickedDoneBuilding);

$("#help-btn").on("click", toggleHelp);

$("#next-btn").on("click", clickedReadyForNextTurn);

$("#play-again-btn").on("click", () => window.location.reload(false));

// §§ mouse & touch events listener functions ------------------------
function handleMouseDown(e, touch) {
  if (gameStarted && itsMyTurn && !doneBtnPressed) {
    if (touch) {
      e.preventDefault();
      // e.preventDefault && e.preventDefault();
      // console.log('touchstart!');
    }
    objectClicked = true;
    // $clickedImgBox = $(this) || e.currentTarget;
    $clickedImgBox = $(e.currentTarget);

    // reset transform rotate:
    transformRotate = 0;
    // console.log($clickedImgBox);
    // show name of clicked object:
    $clickedImgId = $clickedImgBox.find("img").attr("id");
    console.log($clickedImgId);
    $clickedImgBox.addClass("move");
    // start position if mouse event || touch event:
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;

    // get the clicked object to the very front:
    pullToFront($clickedImgBox);

    //  https://css-tricks.com/get-value-of-css-rotation-through-javascript/

    // to move an object, that's already in the construction area, check the transform props and calculate with them when invoking updatePosition():
    if ($clickedImgBox.hasClass("selected")) {
      const transformProps = $(".move").css("transform");
      // console.log('transformProps: ', transformProps);
      var values = transformProps.split("(")[1],
        values = values.split(")")[0],
        values = values.split(",");

      translateX = Number(values[4]);
      translateY = Number(values[5]);
      // console.log('translateX: ', translateX, 'translateY: ', translateY);

      // set move props of clicked object to current values, in case it will be moved or rotated later:
      moveX = translateX;
      moveY = translateY;

      // get the transform/rotate properties:
      let a = Number(values[0]);
      let b = Number(values[1]);
      // let c= Number(values[2]);
      // let d= Number(values[3]);
      // console.log('a: ', a, 'b: ', b, 'c: ', c, 'd: ', d);

      transformRotate = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      // console.log('Rotate props of clicked Object: '+ transformRotate + 'deg');
    }
  }
}

function handleMouseMove(e, touch) {
  if (objectClicked) {
    if (touch) {
      e.preventDefault();
      // e.preventDefault && e.preventDefault();
      // console.log('touchmove!');
    }
    updatePosition(e);
  }
}

function handleMouseUp(e, touch) {
  if (objectClicked) {
    if (touch) {
      e.preventDefault();
      // e.preventDefault && e.preventDefault();
      // console.log('touchend!');
    }
    const $clickedImgBox = $(".move");
    // new position if mouse event || touch event:
    const posX = e.clientX || e.changedTouches[0].clientX;
    const posY = e.clientY || e.changedTouches[0].clientY;
    if (!muted && objectMoved) {
      if (uniSound) {
        universalDropSound.play();
      } else {
        const currentObj = objObj.find(obj => obj.name === $clickedImgId);
        new Audio("./sounds/" + currentObj.sound).play();
      }
    }
    let selected;
    //only if object is dropped (when cursor is) inside the construction area:
    if (
      borderLeft < posX &&
      posX < borderRight &&
      borderTop < posY &&
      posY < borderBottom
    ) {
      $clickedImgBox.addClass("selected");
      selected = true;
      // if dropped ouside construction area, put it back to it's original position:
    } else {
      $clickedImgBox.removeClass("selected");
      selected = false;
      // reset object position:
      $clickedImgBox.css({
        transform: `translate(${0}px, ${0}px)`,
        "z-index": 1
      });
    }

    $clickedImgBox.removeClass("move");
    objectClicked = false;
    objectMoved = false;
    // moveObjects();
    socket.emit("dropping object", {
      activePlayer: activePlayer,
      clickedImgId: $clickedImgId,
      selected: selected
    });
  }
}

// §§ FUNCTIONS: *******************************************
function preloadObjectImages() {
  const objectsArray = Array.from(objectList);
  objectsArray.forEach(object => {
    if (!$(object).hasClass("only1")) {
      // console.log('more than one image!');
      const img = object.querySelector("img");
      // console.log(img.id);
      // console.log(img.src);
      const srcNameV = img.src.split(".png")[0];
      const newSrcBase = srcNameV.substring(0, srcNameV.length - 1);
      // console.log('active image version: ', srcNameV[srcNameV.length - 1]);
      if ($(object).hasClass("more2")) {
        let imgSrc2 = newSrcBase + 2 + ".png";
        let newImageV2 = new Image();
        newImageV2.src = imgSrc2;
      } else if ($(object).hasClass("more3")) {
        let imgSrc2 = newSrcBase + 2 + ".png";
        let imgSrc3 = newSrcBase + 3 + ".png";
        let newImageV2 = new Image();
        newImageV2.src = imgSrc2;
        let newImageV3 = new Image();
        newImageV3.src = imgSrc3;
      }
    }
  });
}

//based on Fisher–Yates shuffle //By Alexey Lebedev :
function shuffleObjects(objects) {
  for (let i = objects.children.length; i >= 0; i--) {
    objects.appendChild(objects.children[(Math.random() * i) | 0]);
  }
}

// move ticker objects in start menu:
function moveTickerObjects() {
  // left = left - 2;
  // left--;
  left = left - 0.07; // trying moving in vw units
  // console.log(left);
  let vwPositionOfFirstObject = (objectList[0].offsetWidth * 100) / viewportWidth;
  if (left < -vwPositionOfFirstObject) {
    //true when first link is off screen..
    // add to left the width of the currently first link
    let widthOfFirstObject = vwPositionOfFirstObject; //use clientWidth instead?
    // console.log(widthOfFirstObject);
    left += widthOfFirstObject;
    // make first link the last link
    objects.appendChild(objectList[0]); //appending will actually remove it from the start and add it to the end
  }
  myReq = requestAnimationFrame(moveTickerObjects); //like setTimeout, but the waiting time is adjusted to the framerate of used hardware(?)
  // objects.style.left = left + "px";
  objects.style.left = left + "vw";
}

function changeLanguage() {
  // I'm the game master and I'm changing the word card language
  let newLanguage;
  if (chosenLanguage == "english") {
    newLanguage = "german";
  } else {
    newLanguage = "english";
  }

  socket.emit("change language", {
    newLanguage: newLanguage
  });
}

function languageHasBeenChanged(newLanguage) {
  // game master changed the word card language.
  chosenLanguage = newLanguage;
  if (newLanguage == "english") {
    $("#english-flag").removeClass("hidden");
  } else if (newLanguage == "german") {
    $("#english-flag").addClass("hidden");
  }
}

function selectedPiece(pieceId) {
  // console.log('myPlayerName in selectedPiece(): ', myPlayerName);
  if (myPlayerName && pieceId) {
    selectedPieceId = pieceId;
    sessionStorage.setItem("selectedPieceId", pieceId);

    socket.emit("selected piece", {
      socketId: mySocketId,
      selectedPieceId: pieceId,
      playerName: myPlayerName
    });
  }
}

function setPlayerName() {
  try {
    myPlayerName = askForName();
    sessionStorage.setItem("myPlayerName", myPlayerName);
  } catch (err) {
    console.log(err);
    setTimeout(() => {
      alert("please type in a name with 1-12 letters!");
      setPlayerName();
    }, 200);
  }
}

function askForName() {
  let playerName = prompt(
    "Welcome to AllThatStuff! \nPlease type in your name (1-12 letters) \nand then pick a color."
  );
  if (playerName.length >= 1 && playerName.length <= 12) {
    return playerName;
  }
  throw new Error("Bad name");
}

function adjustNameFontSize($piece, name) {
  // to adjust font-sizes for player names:
  if (name.length <= 4) {
    $piece.addClass("name4");
  } else if (name.length <= 6) {
    $piece.addClass("name6");
  } else if (name.length <= 8) {
    $piece.addClass("name8");
  } else if (name.length <= 10) {
    $piece.addClass("name10");
  } else if (name.length <= 12) {
    $piece.addClass("name12");
  }
}

function addPlayer(data) {
  players.push(data.selectedPieceId);
  let $piece = $("#start-menu").find("#" + data.selectedPieceId);
  $piece.addClass("selectedPlayerPiece");

  if (data.selectedPieceId == gameMaster) {
    let $crown = $piece.find(".crown");
    $crown.removeClass("hidden");
  }

  let $playerName = $piece.find(".player-name");
  $playerName[0].innerText = data.playerName;

  adjustNameFontSize($piece, data.playerName);

  // if it was me, selecting a piece:
  if (data.selectedPieceId == selectedPieceId) {
    // console.log("$piece: ", $piece);
    $piece.addClass("myPiece");

    if (!iAmTheGameMaster) {
      let $waitingMsg = $("#logo-button-box").find(".waiting-msg");
      $waitingMsg.removeClass("hidden");
    }

    // console.log('$piece[0].innerText: ', $piece[0].innerText);
    // console.log("$playerName: ", $playerName);

    // inconsistent ERR: Cannot set property 'innerText' of undefined:

    // $playerName[0].innerText = "you";
    // console.log('.player-name in $piece: ', $playerName[0]);
  } else {
    // $playerName[0].innerText = "";
  }
}

function addPlayerMidGame(data) {
  // one player got disconnected and needs all the info back to rejoin the game.
  players.push(data.selectedPieceId);

  // if I am the rejoining player:
  if (data.selectedPieceId == selectedPieceId) {
    gameStarted = true;

    $("#start-menu")
      .find("#" + data.selectedPieceId)
      .addClass("selectedPlayerPiece");

    cancelAnimationFrame(myReq);

    doneBtnPressed = data.doneBtnPressed;
    gameMaster = data.gameMaster;
    everyoneGuessed = data.everyoneGuessed;

    $message.removeClass("hidden");

    numberOfTurns = data.numberOfTurnsForThisGame;
    let currentTurn = numberOfTurns - data.numberOfTurnsLeft + 1;
    $rounds[0].innerText = `${currentTurn}/${numberOfTurns}`;

    activePlayer = data.activePlayer;

    // first word card:
    cardTitle[0].innerHTML = data.firstCard.title;
    let cardItems = data.firstCard.items;
    for (let i = 0; i < cardItems.length; i++) {
      items[i].innerHTML = cardItems[i];
    }

    // reset from previous game:
    // create "points if correct" boxes:
    resetPointsIfCorrect();

    correctAnswer = data.correctAnswer;

    $(`#${data.activePlayer}`).addClass("myTurn");
    $("#construction-area").addClass(data.activePlayer);

    let joinedPlayersList = selectPlayersContainer.getElementsByClassName(
      "selectedPlayerPiece"
    );
    let playerArray = Array.from(joinedPlayersList);
    $joinedPlayersContainer.append(playerArray);

    let $myPiece = $("#joined-players").find("#" + data.selectedPieceId);
    $myPiece.addClass("myPiece");

    $(".player-points").removeClass("hidden");
    // get player points:
    addPoints(data);

    $objects[0].innerHTML = data.activeObjects;
    $queue[0].innerHTML = data.queuedObjects;

    $("#start-menu").addClass("hidden");
    $("#main-game").removeClass("hidden");

    if (data.activePlayer != selectedPieceId) {
      // if it's not my turn:
      itsMyTurn = false;

      $message.removeClass("bold");
      $message.removeClass("done");
      $message.removeClass("hidden");
      $message[0].innerText = "...under construction...";

      $("#done-btn").addClass("hidden");

      if (doneBtnPressed) {
        $message.addClass("bold");
        $message[0].innerText = `what's all that stuff?`;
        $message.addClass("done");
      }
    } else if (data.activePlayer == selectedPieceId) {
      // if it is my turn:
      itsMyTurn = true;

      console.log(`you drew card number ${data.firstCard.id}.`);
      console.log(`please build item number ${data.correctAnswer}`);
      $(`.highlight[key=${data.correctAnswer}]`).addClass(selectedPieceId);
      $("#done-btn").removeClass("hidden");

      $message.addClass("bold");
      $message[0].innerText = `it's your turn!`;

      if (doneBtnPressed) {
        $message.removeClass("bold");
        $message[0].innerText = `done!`;
        $message.addClass("done");
      }
    }

    if (data.guessingOrDiscussionTime) {
      $message.removeClass("done");
      $message.addClass("bold");
      $message[0].innerText = "discussion time!";
      dataForNextTurn = data.dataForNextTurn;
      // render guesses and correct answer with "guesses backup":
      $("#card-points")[0].innerHTML = data.cardPointsHTML;
    }
  }

  let $piece = $("#joined-players").find("#" + data.selectedPieceId);
  $piece.addClass("selectedPlayerPiece");

  if (data.selectedPieceId == data.gameMaster) {
    let $crown = $piece.find(".crown");
    $crown.removeClass("hidden");
  }

  let $playerName = $piece.find(".player-name");
  $playerName[0].innerText = data.playerName;

  adjustNameFontSize($piece, data.playerName);
}

function removePlayer(pieceId) {
  // only if the disconnected player had chosen a piece and it's not "":
  if (pieceId) {
    let $piece = $("#" + pieceId);
    // console.log('$piece: ', $piece);
    $piece.removeClass("selectedPlayerPiece");

    players = players.filter(item => item !== pieceId);
    // sessionStorage.setItem("players", players);
  }
}

function startGame() {
  // to start the game with the first 10 ticker objects that are visible when clicking playButton:
  cancelAnimationFrame(myReq); //stops moving ticker
  let objArray = Array.from(objectList);

  // whoever starts the game, is also the start player:
  // TODO: change that to start with a random player
  activePlayer = selectedPieceId;

  let activeObjects = objArray.slice(0, 10);
  let queuedObjects = objArray.slice(10);
  queuedObjects.reverse();
  $objects.append(activeObjects);
  $queue.append(queuedObjects);

  let activeObjectsHTML = $("#objects")[0].innerHTML;
  let queuedObjectsHTML = $("#queue")[0].innerHTML;

  socket.emit("game started", {
    startPlayer: selectedPieceId,
    activeObjects: activeObjectsHTML,
    queuedObjects: queuedObjectsHTML
  });

  getObjectPositions();
}

function gameHasBeenStarted(data) {
  // if I did not start the game, get objects from the one who started the game (game master):
  if (!iAmTheGameMaster) {
    cancelAnimationFrame(myReq);
    $objects[0].innerHTML = data.activeObjects;
    $queue[0].innerHTML = data.queuedObjects;
    getObjectPositions();
  }
  doneBtnPressed = false;

  $(".player-points").removeClass("hidden");
  $(".player-points").each(function() {
    $(this)[0].innerText = "0";
  });

  $("#start-menu").addClass("hidden");
  $("#main-game").removeClass("hidden");

  $(`#${data.startPlayer}`).addClass("myTurn");
  $("#construction-area").addClass(data.startPlayer);

  $message.removeClass("hidden");

  numberOfTurns = data.numberOfTurnsLeft;
  let currentTurn = numberOfTurns - data.numberOfTurnsLeft + 1;
  $rounds[0].innerText = `${currentTurn}/${numberOfTurns}`;

  let joinedPlayersList = selectPlayersContainer.getElementsByClassName(
    "selectedPlayerPiece"
  );
  let playerArray = Array.from(joinedPlayersList);
  $joinedPlayersContainer.append(playerArray);

  activePlayer = data.startPlayer;

  if (data.startPlayer != selectedPieceId) {
    itsMyTurn = false;

    $message.removeClass("bold");
    $message.removeClass("done");
    $message[0].innerText = "...under construction...";

    $("#done-btn").addClass("hidden");
  } else if (data.startPlayer == selectedPieceId) {
    itsMyTurn = true;

    console.log(`you drew card number ${data.firstCard.id}.`);
    console.log(`please build item number ${data.correctAnswer}`);
    $(`.highlight[key=${data.correctAnswer}]`).addClass(selectedPieceId);

    $message.addClass("bold");
    $message[0].innerText = `it's your turn!`;

    $("#done-btn").removeClass("hidden");
  }
  // delete "?" from other player names: // from old game version without player names..
  // let $pieces = $("#joined-players").find(".player");
  // let $otherPlayerNames = $pieces.find(".player-name");
  // for (let i = 0; i < $otherPlayerNames.length; i++) {
  //   // console.log($otherPlayerNames[i].innerText);
  //   if ($otherPlayerNames[i].innerText == "?") {
  //     $otherPlayerNames[i].innerText = "";
  //   }
  // }

  // first word card:
  cardTitle[0].innerHTML = data.firstCard.title;
  let cardItems = data.firstCard.items;
  for (let i = 0; i < cardItems.length; i++) {
    items[i].innerHTML = cardItems[i];
  }

  // reset from previous game:
  myTotalPoints = 0;
  sessionStorage.setItem("myTotalPoints", 0);

  // create "points if correct" boxes:
  resetPointsIfCorrect();

  // $pointsIfCorrect[0].innerHTML = "";
  // let highestAchievablePoint = players.length - 1;
  // for (let i = highestAchievablePoint; i > 0; i--) {
  //   let points = i;
  //   if (i > 5) {
  //     points = 5;
  //   }
  //   let elem = `<div class="points">${points}</div>`;
  //   $pointsIfCorrect.append(elem);
  // }

  correctAnswer = data.correctAnswer;

  if (!muted) {
    startGong.play();
  }

  gameStarted = true;
}

// §§ functions- main game: ----------------------------------------
function get$objBorders($obj) {
  let top = $obj.offset().top;
  let bottom = top + $obj.height();
  let left = $obj.offset().left;
  let right = left + $obj.width();
  return [top, bottom, left, right];
}

function getObjectPositions() {
  $objects.children().each(function() {
    // position() gives position relative to positioned parent
    let objTop = $(this).position().top;
    let objLeft = $(this).position().left;
    // console.log('objTop: ', objTop, 'objLeft: ', objLeft);
    $(this).css({
      top: objTop + "px",
      left: objLeft + "px"
    });
  });
  $objects.children(".img-box").css({
    position: "absolute"
  });
}

function resetPointsIfCorrect() {
  $("#points-if-correct")[0].innerHTML = "";
  let highestAchievablePoint = players.length - 1;
  for (let i = highestAchievablePoint; i > 0; i--) {
    let points = i;
    if (i > 5) {
      points = 5;
    }
    let elem = `<div class="points">${points}</div>`;
    $("#points-if-correct").append(elem);
  }
}

function toggleHelp() {
  if ($instructions.hasClass("hidden")) {
    $instructions.removeClass("hidden");
  } else {
    $instructions.addClass("hidden");
  }
}

// drag&drop objects in main game:
function updatePosition(e) {
  // it's my turn and I'm moving an object.
  objectMoved = true;
  const $clickedImgBox = $(".move");

  if (e.clientX) {
    // if mouse event:
    moveX = e.clientX - startX;
    moveY = e.clientY - startY;
  } else {
    // if touch event:
    moveX = e.changedTouches[0].clientX - startX;
    moveY = e.changedTouches[0].clientY - startY;
  }

  // // only update position, if object is inside body:
  // let [top, bottom, left, right] = get$objBorders($clickedImgBox);
  //
  // if (bodyBorderLeft < left && right < bodyBorderRight) {
  //     moveX = e.clientX - startX - ignoreX;
  // } else {
  //     // ---------- check here in which direction the mousemove is heading and update if direction is away from the body-border
  //     console.log('object outside X body!');
  //     // console.log(e.clientX);
  //     ignoreX = e.clientX;
  // }
  //
  // if (bodyBorderTop < top && bottom < bodyBorderBottom) {
  //     moveY = e.clientY - startY - ignoreY;
  // } else {
  //     // ---------- check here in which direction the mousemove is heading and update if direction is away from the body-border
  //     console.log('object outside Y body!');
  //     // console.log(e.clientY);
  //     ignoreY = e.clientY;
  // }

  // to move an object, that's already in the construction area, check the transform props and calculate with them:
  if ($clickedImgBox.hasClass("selected")) {
    moveX += translateX;
    moveY += translateY;
  }

  $clickedImgBox.css({
    transform: `translate(${moveX}px, ${moveY}px) rotate(${transformRotate}deg)`
  });

  // transform px units in vw units:
  moveXvw = (moveX * 100) / viewportWidth;
  // console.log('moveXvw:', moveXvw);
  moveYvw = (moveY * 100) / viewportWidth;
  // console.log('moveYvw:', moveYvw);
  moveObjects($clickedImgId, moveXvw, moveYvw, transformRotate);
}

function rotateObject(direction) {
  // it's my turn and I'm rotating an object.
  if ($clickedImgBox.hasClass("selected")) {
    let rotate;
    if (direction == "clockwise") {
      rotate = 5;
    } else if (direction == "counterclockwise") {
      rotate = -5;
    }
    // console.log('$clickedImgBox while rotateObject(): ', $clickedImgBox);
    // add new rotation to excisting transform rotate property:
    transformRotate += rotate;

    $clickedImgBox.css({
      transform: `translate(${moveX}px, ${moveY}px) rotate(${transformRotate}deg)`
    });
    moveObjects($clickedImgId, moveXvw, moveYvw, transformRotate);
  }
}

function moveObjects(clickedImgId, moveXvw, moveYvw, transformRotate) {
  // it's my turn and I am moving an object.
  // pass objects with new coordinates to all players:
  let activeObjectsHTML = $("#objects")[0].innerHTML;

  socket.emit("moving objects", {
    activePlayer: activePlayer,
    movedObjects: activeObjectsHTML,
    clickedImgId: clickedImgId,
    moveXvw: moveXvw,
    moveYvw: moveYvw,
    transformRotate: transformRotate
  });
}

function objectsAreMoving(data) {
  // other player moves an object.
  if (!itsMyTurn) {
    // $objects[0].innerHTML = data.movedObjects;

    // move or rotate object:
    $(`.img-box.${data.clickedImgId}`).css({
      transform: `translate(${data.moveXvw}vw, ${data.moveYvw}vw) rotate(${data.transformRotate}deg)`
    });

    // bring recently moved objects to the front:
    pullToFront($(`.img-box.${data.clickedImgId}`));
  }
}

function objectIsDropped(data) {
  // other player drops object.
  if (!itsMyTurn) {
    if (data.selected) {
      // bring recently dropped objects to the front:
      pullToFront($(`.img-box.${data.clickedImgId}`));
      $(`.img-box.${data.clickedImgId}`).addClass("selected");
    } else {
      // reset object position:
      $(`.img-box.${data.clickedImgId}`).removeClass("selected");
      $(`.img-box.${data.clickedImgId}`).css({
        transform: `translate(${0}px, ${0}px)`,
        "z-index": 1
      });
    }
  }
}

function pullToFront($imgBox) {
  let highestZIndex = 1;
  $('#objects').find(".selected").each(function() {
    const currentZIndex = Number($(this).css("z-index"));
    if (currentZIndex > highestZIndex) {
      highestZIndex = currentZIndex;
    }
  });
  $imgBox.css({
    "z-index": highestZIndex + 1
  });
}

function changeObjectImage(imgBox) {
  // it's my turn and I'm changing an object image.

  if (!$(imgBox).hasClass("only1")) {
    // console.log('more than one image!');
    const img = imgBox.querySelector("img");
    const fileName = img.src.split("objects/")[1];
    const projectPath = "/objects/" + fileName;
    const srcNameV = projectPath.split(".png")[0];
    const newSrcBase = srcNameV.substring(0, srcNameV.length - 1);

    let newPicSrc;
    let removeClass;
    let addClass;
    if ($(imgBox).hasClass("more2")) {
      if ($(imgBox).hasClass("v1")) {
        img.src = newSrcBase + 2 + ".png";
        newPicSrc = newSrcBase + 2 + ".png";
        $(imgBox)
          .removeClass("v1")
          .addClass("v2");
        removeClass = "v1";
        addClass = "v2";
      } else if ($(imgBox).hasClass("v2")) {
        img.src = newSrcBase + 1 + ".png";
        newPicSrc = newSrcBase + 1 + ".png";
        $(imgBox)
          .removeClass("v2")
          .addClass("v1");
        removeClass = "v2";
        addClass = "v1";
      }
    } else if ($(imgBox).hasClass("more3")) {
      if ($(imgBox).hasClass("v1")) {
        img.src = newSrcBase + 2 + ".png";
        newPicSrc = newSrcBase + 2 + ".png";
        $(imgBox)
          .removeClass("v1")
          .addClass("v2");
        removeClass = "v1";
        addClass = "v2";
      } else if ($(imgBox).hasClass("v2")) {
        img.src = newSrcBase + 3 + ".png";
        newPicSrc = newSrcBase + 3 + ".png";
        $(imgBox)
          .removeClass("v2")
          .addClass("v3");
        removeClass = "v2";
        addClass = "v3";
      } else if ($(imgBox).hasClass("v3")) {
        img.src = newSrcBase + 1 + ".png";
        newPicSrc = newSrcBase + 1 + ".png";
        $(imgBox)
          .removeClass("v3")
          .addClass("v1");
        removeClass = "v3";
        addClass = "v1";
      }
    }
    // console.log("newPicSrc:", newPicSrc);
    socket.emit("changed object image", {
      clickedImgId: $clickedImgId,
      newPicSrc: newPicSrc,
      removeClass: removeClass,
      addClass: addClass
    });
  } else {
    console.log("this object has only one image!");
  }
}

function objectImageChanged(data) {
  // other player changed object image.
  if (!itsMyTurn) {
    const $img = $("#objects").find(`#${data.clickedImgId}`);
    // set new image source:
    $img.attr("src", data.newPicSrc);
    $(`.img-box.${data.clickedImgId}`)
      .removeClass(data.removeClass)
      .addClass(data.addClass);
  }
}

function clickedDoneBuilding() {
  let $selectedObjects = $("#objects").find(".selected");

  // check if there is at least 1 object in the construction area:
  if ($selectedObjects.length > 0) {
    let activeObjectsHTML = $("#objects")[0].innerHTML;

    // TODO: In case someone resized their window during the building, the position of objects in the construction area could be a bit off on their screen. so to make sure, they see exactly what the builder built, send coordinates of selected objects again...

    socket.emit("done building", {
      activePlayer: activePlayer,
      movedObjects: activeObjectsHTML
    });
  }
}

function buildingIsDone(data) {
  console.log(data.message);
  if (!muted) {
    doneGong.play();
  }
  if (!itsMyTurn) {
    // $objects[0].innerHTML = data.movedObjects;
    $message.addClass("bold");
    $message[0].innerText = `what's all that stuff?`;
  } else if (itsMyTurn) {
    $message.removeClass("bold");
    $message[0].innerText = `done!`;
  }
  $message.addClass("done");
  doneBtnPressed = true;
  // sessionStorage.setItem("doneBtnPressed", doneBtnPressed);
}

function guessWordFromCard(e) {
  if (!myGuess & doneBtnPressed) {
    myGuess = e.currentTarget.getAttribute("key");
    // sessionStorage.setItem("myGuess", myGuess);

    // console.log('you clicked on: ', myGuess);
    $(`.highlight[key=${myGuess}]`).addClass(`${selectedPieceId}`);
    socket.emit("made a guess", {
      guessingPlayer: selectedPieceId,
      guessedItem: myGuess
    });
  }
}

function someOneGuessed(data) {
  // console.log("someone guessed");
  let $highestFreePointBox = $("#points-if-correct")
    .children()
    .not(".claimed")
    .first();
  // console.log('highestFreePointBox:', $highestFreePointBox);
  $highestFreePointBox.addClass(`claimed ${data.guessingPlayer}`);
  backupGuesses();

  if (!muted) {
    plop.play();
  }
}

function backupGuesses() {
  // save status of guesses in case someone disconnects/reconnects:
  if (iAmTheGameMaster) {
    let cardPointsHTML = $("#card-points")[0].innerHTML;

    socket.emit("guesses backup", {
      cardPointsHTML: cardPointsHTML
    });
  }
}

function showAnswers(data) {
  // console.log("guessed answers: ", data.guessedAnswers);
  // console.log("playerPointsIfCorrect: ", data.playerPointsIfCorrect);
  // console.log("actualPlayerPoints: ", data.actualPlayerPoints);
  // console.log("playerPointsTotal: ", data.playerPointsTotal);
  if (!itsMyTurn) {
    $(`.highlight[key=${myGuess}]`).removeClass(selectedPieceId);
  }
  // show answers of all guessers:
  for (let player in data.guessedAnswers) {
    let $guessesBoxInCardItem = $(
      `.table-row[key=${data.guessedAnswers[player]}]`
    ).find(".guesses");

    let newGuess = `<div class="guess ${player}"></div>`;

    $guessesBoxInCardItem.append(newGuess);
    // empty guesses div for next turn.... also for startGame?
  }
  backupGuesses();

  if (!muted) {
    // pop sound for displaying all answers:
    plop.play();
    // drumroll until showCorrectAnswer:
    // adding 700ms..
    setTimeout(() => {
      drumroll.play();
    }, 700);
  }
}

function showCorrectAnswer(data) {
  // show correct answer:
  $(`.highlight[key=${data.correctAnswer}]`).addClass(activePlayer);
  backupGuesses();
}

function addPoints(data) {
  for (let player in data.playerPointsTotal) {
    let $piece = $("#" + player);
    let $playerPoints = $piece.find(".player-points");
    $playerPoints[0].innerText = data.playerPointsTotal[player];
    flashPoints($playerPoints);

    if (player == selectedPieceId) {
      myTotalPoints = data.playerPointsTotal[player];
      sessionStorage.setItem("myTotalPoints", data.playerPointsTotal[player]);
    }
  }

  if (!muted) {
    bubblePop1.play();
  }
}

function flashPoints($playerPoints) {
  $playerPoints.css({
    transform: `scale(1.2)`
  });
  setTimeout(function() {
    $playerPoints.css({
      transform: `scale(1)`
    });
  }, 350);
}

function clickedReadyForNextTurn() {
  // game master decides when it's time for the next turn:
  discardAndRefillObjects();
}

function discardAndRefillObjects() {
  // NOTE: this function is only triggered by the GAME MASTER when clicking "ready for next turn". other players will get the objects for next turn from the game master.
  const $selectedObjects = $('#objects').find(".selected");

  const numberOfUsedObjects = $selectedObjects.length;

  $objects.children(".img-box").css({
    position: "unset"
  });
  $selectedObjects.each(function() {
    // reset object images to v1:
    resetObjectImage($(this));

    $(this).removeClass("selected");
    $(this).css({
      position: "unset",
      transform: `translate(${0}px, ${0}px)`,
      "z-index": 1
    });
    $queue.prepend($(this));
  });
  for (let i = 0; i < numberOfUsedObjects; i++) {
    // used together with css flex wrap in #objects:
    // $objects.append($queue.children().last());

    // used together with css flex wrap-reverse in #objects:
    $objects.prepend($queue.children().last());
  }

  let activeObjectsHTML = $("#objects")[0].innerHTML;
  let queuedObjectsHTML = $("#queue")[0].innerHTML;

  socket.emit("objects for next turn", {
    activePlayer: dataForNextTurn.activePlayer,
    activeObjects: activeObjectsHTML,
    queuedObjects: queuedObjectsHTML
  });

  getObjectPositions();
}

function resetObjectImage($selectedObject) {
  if (!$selectedObject.hasClass('v1') && !$selectedObject.hasClass('only1')) {
    let $img = $selectedObject.find('img');
    let oldSrc = $img.attr('src');
    let srcNameV = oldSrc.split(/2.png|3.png/g)[0];
    let newSrc = srcNameV + "1.png";

    // set new image source:
    $img.attr("src", newSrc);
    $selectedObject
      .removeClass("v2 v3")
      .addClass("v1");
  }
}

function changeTurn(data) {
  $(`#${data.activePlayer}`).removeClass("myTurn");
  $("#construction-area").removeClass(data.activePlayer);

  $(`#${data.nextPlayer}`).addClass("myTurn");
  $("#construction-area").addClass(data.nextPlayer);

  $(`.highlight[key=${correctAnswer}]`).removeClass(activePlayer);

  // reset guess markers:
  let $guessesBoxesList = $(`.table-row`).find(".guesses");
  for (let i = 0; i < $guessesBoxesList.length; i++) {
    $guessesBoxesList[i].innerHTML = "";
  }

  // create "points if correct" boxes:
  // reset from previous game:
  resetPointsIfCorrect();

  activePlayer = data.nextPlayer;
  correctAnswer = data.correctAnswer;
  myGuess = "";
  doneBtnPressed = false;
  everyoneGuessed = false;

  // objects and queue objects for the next turn were delivered by the game master. other players:
  if (!iAmTheGameMaster) {
    $objects[0].innerHTML = data.activeObjects;
    $queue[0].innerHTML = data.queuedObjects;

    getObjectPositions();
  }

  // new word card:
  cardTitle[0].innerHTML = data.newCard.title;
  let cardItems = data.newCard.items;
  for (let i = 0; i < cardItems.length; i++) {
    items[i].innerHTML = cardItems[i];
  }

  $message.removeClass("hidden");
  $message.removeClass("done");
  $("#next-btn").addClass("hidden");

  // update number of turns left:
  let currentTurn = numberOfTurns - data.numberOfTurnsLeft + 1;
  $rounds[0].innerText = `${currentTurn}/${numberOfTurns}`;

  // if next turn is my turn:
  if (data.nextPlayer == selectedPieceId) {
    console.log(`you drew card number ${data.newCard.id}.`);
    console.log(`please build item number ${data.correctAnswer}`);
    $(`.highlight[key=${data.correctAnswer}]`).addClass(selectedPieceId);
    $("#done-btn").removeClass("hidden");
    $message[0].innerText = `it's your turn!`;
    $message.addClass("bold");
    itsMyTurn = true;
  } else {
    // if next turn is not my turn:
    $("#done-btn").addClass("hidden");
    $message.removeClass("bold");
    $message[0].innerText = "...under construction...";
    itsMyTurn = false;
  }

  if (!muted) {
    startGong.play();
  }
}

function endGame() {
  socket.emit("end game");
}

function gameEnds(data) {
  console.log(`game is over`);
  console.log(`player "${data.winner}" wins!`);

  $("#main-game").addClass("hidden");
  $("#game-end").removeClass("hidden");

  let $playersEnd = $("#players-end");
  let ranking = data.rankingArray;
  for (let i = 0; i < ranking.length; i++) {
    let playerElement = `<div class="player ${ranking[i].player}">
                <div class="player-name">${ranking[i].name}</div>
                <div class="player-points">${ranking[i].points}</div>
            </div>`;

    $playersEnd.append(playerElement);

    let $piece = $("#players-end").find("." + ranking[i].player);
    adjustNameFontSize($piece, ranking[i].name);
  }
  if (!muted) {
    successJingle.play();
  }
}

function newGameMaster(data) {
  gameMaster = data.newGameMaster;
  $(`#${data.oldGameMaster}`).find('.crown').addClass('hidden');
  $(`#${data.newGameMaster}`).find('.crown').removeClass('hidden');
  // if (!gameStarted) {
  //   let $piece = $("#start-menu").find(`"#${data.oldGameMaster}`);
  // }
  if (!gameStarted) {
    let $waitingMsg = $("#logo-button-box").find(".waiting-msg");
    // if I am the new game master:
    if (data.newGameMaster == selectedPieceId) {
      iAmTheGameMaster = true;
      $waitingMsg.addClass("hidden");
      let $buttonBox = $("#logo-button-box").find(".buttonBox");
      $buttonBox.removeClass("hidden");
      $('#chosen-language').find('.crown').removeClass('hidden');
    } else {
      // $waitingMsg.removeClass("hidden");
      // if I was the old game master:
      if (data.oldGameMaster == selectedPieceId) {
        // no change needed because I was the one that disconnected and the page is reloading/rerendered anyway...
      }
    }
  // if game started:
  } else {
    // if I am the new game master:
    if (data.newGameMaster == selectedPieceId) {
      iAmTheGameMaster = true;
      if (everyoneGuessed) {
        $("#next-btn").removeClass("hidden");
      }
    }
  }
}

// §§ SOCKETS: *******************************************
// socket.on("disconnect", function() {
//   iGotDisconnected = true;
//   console.log("disconnected");
//   // setTimeout(() => {
//   //   window.alert(`you got disconnected!
//   //     please refresh the page to rejoin the game :)`);
//   // }, 200);
//
// });

// socket.on("reconnect", function() {
//   console.log('reconnecting...');
// });

// socket.on("connect", function() {
//   console.log('connecting...');
//   if (iGotDisconnected) {
//     // location.reload();
//     window.location.reload(false);
//     // setTimeout(() => {
//     //   window.location.reload(false);
//     // }, 500);
//   }
// });

socket.on("welcome", function(data) {
  selectedPieceId = sessionStorage.getItem("selectedPieceId");
  myPlayerName = sessionStorage.getItem("myPlayerName");

  sessionStorage.setItem("mySocketId", data.socketId);
  mySocketId = data.socketId;
  console.log("Welcome to AllThatStuff!");

  // set language of word cards:
  if (chosenLanguage != data.chosenLanguage) {
    languageHasBeenChanged(data.chosenLanguage);
  }

  // check if the game has already started:
  gameStarted = data.gameStarted;
  if (!gameStarted) {
    if (!myPlayerName) {
      setTimeout(() => {
        setPlayerName();
      }, 200);
    }

    // remember previously selected piece on page reload:
    if (selectedPieceId && myPlayerName) {
      // TODO In case of a replay, I should also check here, if the selected piece has been taken by a new player in the meantime....
      selectedPiece(selectedPieceId);
    }
  } else {
    // if the game has already started:
    if (selectedPieceId && myPlayerName) {
      // e.g. if a joined player disconnected unintentionally and reconnects mid game..
      socket.emit("let me rejoin the game", {
        selectedPieceId: selectedPieceId,
        playerName: myPlayerName,
        myTotalPoints: myTotalPoints
      });
    } else {
      // if the player is new player and didn't join the game before
      setTimeout(() => {
        window.alert("game has already started, please try again later");
      }, 200);
    }
  }

  gameMaster = data.gameMaster;

  players = data.selectedPieces;
  playerNames = data.playerNames;

  // console.log('players in socket.on("welcome"): ', players);
  for (let i = 0; i < players.length; i++) {
    let $piece = $("#start-menu").find("#" + players[i]);
    let $playerName = $piece.find(".player-name");
    $playerName[0].innerText = playerNames[players[i]];
    $piece.addClass("selectedPlayerPiece");
    adjustNameFontSize($piece, $playerName[0].innerText);

    if (players[i] == gameMaster) {
      let $crown = $piece.find(".crown");
      $crown.removeClass("hidden");
    }
  }
});

socket.on("add selected piece", function(data) {
  // the first player who selects a piece, becomes game master:
  gameMaster = data.gameMaster;

  // if I'm the game master:
  if (gameMaster == selectedPieceId && !iAmTheGameMaster) {
    iAmTheGameMaster = true;
    console.log("you are the game master");
    $("#chosen-language").addClass("game-master");
    $("#chosen-language")
      .find(".crown")
      .removeClass("hidden");

    let $buttonBox = $("#logo-button-box").find(".buttonBox");
    $buttonBox.removeClass("hidden");
  }

  if (data.selectedPieceId && data.playerName) {
    addPlayer(data);
  }
  // console.log('players after "add selected piece": ', players);
});

socket.on("remove selected piece", function(pieceId) {
  removePlayer(pieceId);
  // console.log('players after "remove selected piece": ', players);
});

socket.on("language has been changed", function(data) {
  languageHasBeenChanged(data.newLanguage);
});

socket.on("game has been started", function(data) {
  console.log(data.message);
  // console.log('data.activeObjects: ', data.activeObjects);
  // console.log('data.queuedObjects: ', data.queuedObjects);
  // only if player joined (& in case of a second game, if player pressed "play again"):
  if (selectedPieceId && !gameStarted) {
    gameHasBeenStarted(data);
  }
});

socket.on("next turn", function(data) {
  console.log(`it's ${data.nextPlayer}'s turn now!'`);
  changeTurn(data);
});

socket.on("objects are moving", function(data) {
  objectsAreMoving(data);
});

socket.on("object dropped", function(data) {
  objectIsDropped(data);
});

socket.on("object image changed", function(data) {
  objectImageChanged(data);
});

socket.on("building is done", function(data) {
  buildingIsDone(data);
});

socket.on("someone guessed", function(data) {
  someOneGuessed(data);
});

socket.on("everyone guessed", function(data) {
  console.log("everyone guessed");
  everyoneGuessed = true;
  setTimeout(() => {
    showAnswers(data);
    setTimeout(() => {
      showCorrectAnswer(data);
      setTimeout(() => {
        addPoints(data);
        setTimeout(() => {
          // show button for the game master to click, when everyone is ready for the next turn to start:
          dataForNextTurn = data;
          activePlayer = data.activePlayer;

          if (iAmTheGameMaster) {
            $("#next-btn").removeClass("hidden");
          }
          if (itsMyTurn) {
            $("#done-btn").addClass("hidden");
          }
          $message.removeClass("done");
          $message.addClass("bold");
          $message[0].innerText = "discussion time!";

        }, 1000); // time before change to next turn / next-button shows up
      }, 1500); // time before addPoints
    }, 1500); // time before showCorrectAnswer
  }, 500); // time before showAnswers
});

socket.on("game ends", function(data) {
  gameEnds(data);
});

socket.on("add player midgame", function(data) {
  console.log(`${data.playerName} wants to rejoin the game`);
  addPlayerMidGame(data);
});

socket.on("new game master", function(data) {
  console.log(`${data.oldGameMaster} got disconnected. ${data.newGameMaster} is the new gameMaster`);
  newGameMaster(data);
});
