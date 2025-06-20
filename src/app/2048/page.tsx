"use client";
import { useState, useEffect } from "react";

const tileIcons = [
  "/assets/ssd.png",
  "/assets/ram.png",
  "/assets/cpu.png",
  "/assets/gpu.png",
  "/assets/nexus-cube.png",
];

function getInitialGrid() {
  const grid = Array(4)
    .fill(0)
    .map(() => Array(4).fill(null));
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
}

function getEmptyCells(grid) {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === null) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid) {
  const cells = getEmptyCells(grid);
  if (cells.length === 0) return;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  grid[r][c] = 0;
}

function move(grid, direction) {
  let moved = false;

  function moveRow(row) {
    let newRow = row.slice();
    let mergedRow = [false, false, false, false];
    for (let i = 1; i < 4; i++) {
      if (newRow[i] !== null) {
        let j = i;
        while (j > 0 && newRow[j - 1] === null) {
          newRow[j - 1] = newRow[j];
          newRow[j] = null;
          j--;
          moved = true;
        }
        if (
          j > 0 &&
          newRow[j - 1] !== null &&
          newRow[j - 1] === newRow[j] &&
          !mergedRow[j - 1]
        ) {
          newRow[j - 1]++;
          newRow[j] = null;
          mergedRow[j - 1] = true;
          moved = true;
        }
      }
    }
    return newRow;
  }

  let newGrid = grid.map((row) => row.slice());

  if (direction === "left") {
    for (let r = 0; r < 4; r++) {
      newGrid[r] = moveRow(newGrid[r]);
    }
  } else if (direction === "right") {
    for (let r = 0; r < 4; r++) {
      newGrid[r] = moveRow(newGrid[r].slice().reverse()).reverse();
    }
  } else if (direction === "up") {
    for (let c = 0; c < 4; c++) {
      let col = [0, 1, 2, 3].map((r) => newGrid[r][c]);
      let newCol = moveRow(col);
      for (let r = 0; r < 4; r++) {
        newGrid[r][c] = newCol[r];
      }
    }
  } else if (direction === "down") {
    for (let c = 0; c < 4; c++) {
      let col = [0, 1, 2, 3].map((r) => newGrid[r][c]).reverse();
      let newCol = moveRow(col).reverse();
      for (let r = 0; r < 4; r++) {
        newGrid[r][c] = newCol[r];
      }
    }
  }
  return [newGrid, moved];
}

export default function Page() {
  const [grid, setGrid] = useState(getInitialGrid);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      let dir = null;
      if (e.key === "ArrowLeft") dir = "left";
      if (e.key === "ArrowRight") dir = "right";
      if (e.key === "ArrowUp") dir = "up";
      if (e.key === "ArrowDown") dir = "down";
      if (!dir) return;

      const [newGrid, moved] = move(grid, dir);
      if (moved) {
        addRandomTile(newGrid);
        setGrid(newGrid);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, gameOver]);

  useEffect(() => {
    if (getEmptyCells(grid).length === 0) {
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (
            (r < 3 && grid[r][c] === grid[r + 1][c]) ||
            (c < 3 && grid[r][c] === grid[r][c + 1])
          ) {
            canMove = true;
          }
        }
      }
      if (!canMove) setGameOver(true);
    }
  }, [grid]);

  function restart() {
    setGrid(getInitialGrid());
    setGameOver(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">2048: GPU Edition</h2>
      <div className="grid grid-cols-4 gap-2 bg-gray-900 p-4 rounded-2xl shadow-2xl">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={r + "-" + c}
              className="w-16 h-16 bg-gray-800 flex items-center justify-center rounded-xl"
            >
              {cell !== null && tileIcons[cell] && (
                <img
                  src={tileIcons[cell]}
                  alt=""
                  width={48}
                  height={48}
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </div>
          ))
        )}
      </div>
      {gameOver && (
        <div className="mt-4 text-red-500 text-xl font-bold">
          Game Over!
        </div>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        onClick={restart}
      >
        Restart
      </button>
      <div className="mt-2 text-sm text-gray-500">
        Use arrow keys to play.
      </div>
    </div>
  );
}

