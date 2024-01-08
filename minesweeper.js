// Meant for Creating all the helper functions
// Functions required:

// 1. Create Board
// a. Left Click on tiles
// a1. If bomb, end game
// a2. If number, reveal number
// a3. If empty square, reveal all adjacent empty squares (recursive?)
// b. Right click on tiles
// b1. Mark on tile

// 2. Populate Mines randomly (DONE)

// 3. Reset board when refreshed (DONE)

// 4. When all tiles are opened, Win game (Check if all tiles don't have hidden status)

export const data_status = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked",
};

// --- Create Array & Return Board ---
export function createBoard(boardSize, amountMines) {
  const minesCreatedArray = createMines(boardSize, amountMines);

  const board = [];

  for (let i = 0; i < boardSize; i++) {
    const row = [];

    for (let j = 0; j < boardSize; j++) {
      const x = i;
      const y = j;

      // Mine Information
      const mineObject = {
        tileElement: document.createElement("div"), // Tile Element

        x, // X-Coord
        y, // Y-Coord

        // Compares current position with mines array
        hasMine: compareMineArrayWithCurrent(minesCreatedArray, { x, y }),

        // Set the default status to hidden
        _status: data_status.HIDDEN,

        // To keep track of the # of mines surrouding this tile
        numSurroundingMines: 0,

        // Getter
        get status() {
          return this._status;
        },

        // Setter
        set status(newStatus) {
          // Ensure that the newStatus passed in is one of the status
          if (Object.values(data_status).includes(newStatus))
            this._status = newStatus;
        },
      };
      row.push(mineObject);
    }
    board.push(row);
  }
  return board;
}

// --------------------- HELPER FUNCTIONS ---------------------
// ~~~ Randomly distribute mine ~~~
function createMines(boardSize, amountMines) {
  const mineArray = [];

  while (mineArray.length < amountMines) {
    const tempMine = {
      // Gives a random x-coordinate from 0 to board size
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };

    // Ensure that there won't be a duplicate position by comparing
    // the array & the current tempMine
    if (!compareMineArrayWithCurrent(mineArray, tempMine))
      mineArray.push(tempMine);
  }
  return mineArray;
}

// ~~~ Ensure no Duplicate Mine Positions ~~~
function compareMineArrayWithCurrent(mineArray, tempMine) {
  return mineArray.some((each) => {
    return each.x === tempMine.x && each.y === tempMine.y;
  });
}

// ~~~ Check the Tile (Left Click) ~~~
export function checkTile(tile, board) {
  let surroundingBombCounter = 0;

  // Do nothing if the tile is not hidden
  if (tile.status !== data_status.HIDDEN) return;

  // Return if the tile is a bomb
  if (tile.hasMine) return -1;

  // Check the number of bombs surrounding this tile
  const surroundingTilesArray = getSurroundingTiles(tile, board);

  // Counts the number of bombs surrounding the tile
  surroundingTilesArray.forEach((each) => {
    if (each.hasMine) surroundingBombCounter++;
  });

  tile.numSurroundingMines = surroundingBombCounter;

  return surroundingBombCounter;
}

export function getSurroundingTiles(tile, board) {
  const xCoord = tile.x;
  const yCoord = tile.y;

  const surroundingTiles = [];

  for (let row = -1; row < 2; row++) {
    for (let curr = -1; curr < 2; curr++) {
      const tempX = xCoord + row;
      const tempY = yCoord + curr;

      if (tempX === xCoord && tempY === yCoord) continue;
      if (tempX < 0 || tempX >= board.length) continue;
      if (tempY < 0 || tempY >= board.length) continue;

      board.forEach((row) => {
        const tileFound = row.find((eachTile) => {
          return eachTile.x === tempX && eachTile.y === tempY;
        });

        if (tileFound != undefined) surroundingTiles.push(tileFound);
      });
    }
  }
  return surroundingTiles;
}

// ~~~ Mark Tile (Right Click) ~~~
export function markTile(tile) {
  if (tile.status === data_status.HIDDEN) {
    tile.status = data_status.MARKED;
  } else if (tile.status === data_status.MARKED) {
    tile.status = data_status.HIDDEN;
  }
  return tile;
}

// -------------------------------------------------------------
