import {
  createBoard,
  checkTile,
  markTile,
  data_status,
  getSurroundingTiles,
} from "./minesweeper.js";

const boardElement = document.querySelector(".board");
const minesLeftElement = document.querySelector(".subtext");

const BOARD_SIZE = 10;
const NUM_BOMBS = 10;

let minesLeft = NUM_BOMBS;
let queue = [];
let alreadyChecked = new Set();

// This will allow the box to fit 10
boardElement.style.setProperty("--size", BOARD_SIZE);

// Creating Board & Adding to DOM
const board = createBoard(BOARD_SIZE, NUM_BOMBS);

// Setting the Mines counter
setMinesLeftText();

board.forEach((row) => {
  row.forEach((tile) => {
    const tileElement = tile.tileElement; // Creating the element
    tileElement.dataset.status = tile.status; // Setting the element's status

    // Left Click on Tile
    tileElement.addEventListener("click", () => leftClickEventListener(tile));

    // Right Click on Tile
    tileElement.addEventListener("contextmenu", (e) => {
      // Prevent browser right click
      e.preventDefault();

      // Do nothing if tile is not hidden & not marked
      if (
        tileElement.dataset.status !== data_status.HIDDEN &&
        tileElement.dataset.status !== data_status.MARKED
      )
        return;

      // Setting the "Mines Remaining"
      if (tileElement.dataset.status === data_status.HIDDEN) minesLeft--;
      else if (tileElement.dataset.status === data_status.MARKED) minesLeft++;
      setMinesLeftText();

      // Amending the status of the tile
      const amendedTile = markTile(tile);
      tileElement.dataset.status = amendedTile.status;
    });

    boardElement.appendChild(tileElement); // Adding the tile to the board
  });
});

// --------------------- HELPER FUNCTIONS ---------------------

// ~~~ Set either mines left / lose or win
function setMinesLeftText(num = 0) {
  minesLeftElement.innerText = `Mines Left: ${minesLeft}`;

  // When Mine is triggered
  if (num === -1) {
    minesLeftElement.innerText = "You Lose!";
    gameOver(-1);
  } else if (num === -10) {
    minesLeftElement.innerText = "You Win!";
    gameOver();
  }
}

// ~~~ Left Click Event Listener ~~~
function leftClickEventListener(tile) {
  const tileElement = tile.tileElement;

  // Check Win
  if (checkWin()) setMinesLeftText(-10);

  let mineCounter = checkTile(tile, board);

  // If the tile has been marked, don't allow Left click
  if (tileElement.dataset.status === data_status.MARKED) return;

  // When user click on a bomb
  if (mineCounter < 0) {
    tileElement.dataset.status = data_status.MINE;
    setMinesLeftText(-1);
  }
  // When the square is a number
  else if (mineCounter > 0) {
    // Setting the text
    tileElement.innerText = mineCounter;
    // Setting the font
    tileElement.dataset.status = data_status.NUMBER;
  }
  // When the square is a blank
  else {
    tileElement.dataset.status = "";

    // If surroundingBomb is 0, reveal surrounding blank tiles too
    revealSurroundingBlankTiles(tile);
  }
}

// ~~~ Reveal Surrounding Blank Tiles ~~~
function revealSurroundingBlankTiles(tile) {
  const surroundingTiles = getSurroundingTiles(tile, board);

  surroundingTiles.forEach((eachTile) => {
    if (eachTile.numSurroundingMines === 0) {
      board[eachTile.x][eachTile.y].tileElement.dataset.status = "";

      if (alreadyChecked.has(eachTile.x.toString() + eachTile.y.toString()))
        return;

      queue.push(eachTile);

      // While there are things to check in the queue, run this again
      while (queue.length > 0) {
        const current = queue.shift();

        alreadyChecked.add(current.x.toString() + current.y.toString());
        leftClickEventListener(current);
      }
    }
  });
}

// ~~~ Game Over - Reveal all Mines + Prevent User Action ~~~
function gameOver(code) {
  board.forEach((eachRow) => {
    eachRow.forEach((eachTile) => {
      // Get the current tileElement
      const currTileElement = eachTile.tileElement;

      // Revealing all mines
      if (eachTile.hasMine) {
        if (code === -1) {
          eachTile.status = data_status.MINE;
          currTileElement.dataset.status = data_status.MINE;
        }
        // Remove clicking function
        boardElement.addEventListener("click", stopProp, { capture: true });
        boardElement.addEventListener("contextmenu", stopProp, {
          capture: true,
        });
      }
    });
  });
}

// ~~~ Check Win ~~~
function checkWin() {
  // Win Condition: All safe tiles must be opened for win condition
  let safeTileNotOpenedCounter = 0;

  board.forEach((eachRow) => {
    eachRow.forEach((eachTile) => {
      const currentTileElement = eachTile.tileElement;
      if (
        eachTile.hasMine &&
        currentTileElement.dataset.status === data_status.HIDDEN
      )
        safeTileNotOpenedCounter++;
    });
  });

  if (safeTileNotOpenedCounter === 0) return true;
}

// Prevent users from clicking when game ends
function stopProp(e) {
  e.stopImmediatePropagation();
}
