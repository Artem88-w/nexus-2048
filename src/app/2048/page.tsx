// src/app/2048/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";

const tileIcons = [
  "/assets/ssd.png",
  "/assets/hdd.png",
  "/assets/ram.png",
  "/assets/matric.png",
  "/assets/cpu.png",
  "/assets/gpu.png",
  "/assets/nexus.png"
];

function getInitialGrid(): (number | null)[][] {
  const grid = Array(4)
    .fill(0)
    .map(() => Array<null | number>(4).fill(null));
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
}

function getEmptyCells(grid: (number | null)[][]): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === null) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid: (number | null)[][]) {
  const cells = getEmptyCells(grid);
  if (!cells.length) return;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  grid[r][c] = 0;
}

function move(grid: (number | null)[][], direction: string): [(number | null)[][], boolean] {
  let moved = false;
  function moveRow(row: (number | null)[]) {
    const newRow = row.slice();
    const merged = [false, false, false, false];
    for (let i = 1; i < 4; i++) {
      if (newRow[i] !== null) {
        let j = i;
        while (j > 0 && newRow[j - 1] === null) {
          newRow[j - 1] = newRow[j];
          newRow[j] = null;
          j--;
          moved = true;
        }
        if (j > 0 && newRow[j - 1] === newRow[j] && !merged[j - 1]) {
          newRow[j - 1]!++;
          newRow[j] = null;
          merged[j - 1] = true;
          moved = true;
        }
      }
    }
    return newRow;
  }

  const newGrid = grid.map(row => row.slice());
  if (direction === "left") {
    for (let r = 0; r < 4; r++) newGrid[r] = moveRow(newGrid[r]);
  } else if (direction === "right") {
    for (let r = 0; r < 4; r++) newGrid[r] = moveRow(newGrid[r].slice().reverse()).reverse();
  } else if (direction === "up") {
    for (let c = 0; c < 4; c++) {
      const col = [0, 1, 2, 3].map(r => newGrid[r][c]);
      const movedCol = moveRow(col);
      for (let r = 0; r < 4; r++) newGrid[r][c] = movedCol[r];
    }
  } else if (direction === "down") {
    for (let c = 0; c < 4; c++) {
      const col = [0, 1, 2, 3].map(r => newGrid[r][c]).reverse();
      const movedCol = moveRow(col).reverse();
      for (let r = 0; r < 4; r++) newGrid[r][c] = movedCol[r];
    }
  }
  return [newGrid, moved];
}

export default function Page() {
  const [grid, setGrid] = useState<(number | null)[][]>(getInitialGrid());
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMusicOn, setIsMusicOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // play/pause music and pause when video overlay is active
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.5;
    if (isMusicOn && !win) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isMusicOn, win]);

  // handle arrow keys for moves
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || win) return;
      let dir: string | null = null;
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
  }, [grid, gameOver, win]);

  // detect loss
  useEffect(() => {
    if (getEmptyCells(grid).length === 0) {
      let canMove = false;
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
          if (
            (r < 3 && grid[r][c] === grid[r + 1][c]) ||
            (c < 3 && grid[r][c] === grid[r][c + 1])
          )
            canMove = true;
      if (!canMove) setGameOver(true);
    }
  }, [grid]);

  // detect win
  useEffect(() => {
    let found = false;
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (grid[r][c] === tileIcons.length - 1) found = true;
    setWin(found);
  }, [grid]);

  // close video on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && win) setWin(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [win]);

  const restart = () => {
    setGrid(getInitialGrid());
    setGameOver(false);
    setWin(false);
  };

  const gridBg = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const tileBg = "bg-gray-800";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full p-4"
      style={{
        backgroundImage: "url('/assets/nexus-fon.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* hidden audio player */}
      <audio ref={audioRef} src="/assets/music.mp3" style={{ display: "none" }} />

      <h2 className="text-2xl font-bold mb-4">
        2048 Nexus Edition by Dirty Squirrel
      </h2>

      {/* theme toggle */}
      <button
        className={`mb-2 px-4 py-2 rounded-xl shadow ${
          theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
      </button>

      {/* music toggle */}
      <button
        className={`mb-4 px-4 py-2 rounded-xl shadow ${
          isMusicOn ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
        onClick={() => setIsMusicOn(on => !on)}
      >
        {isMusicOn ? "Mute Music" : "Play Music"}
      </button>

      {/* game grid */}
      <div className={`grid grid-cols-4 gap-2 p-4 rounded-2xl shadow-2xl ${gridBg}`}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-16 h-16 ${tileBg} flex items-center justify-center rounded-xl`}
            >
              {cell !== null && (
                <img
                  src={tileIcons[cell]}
                  width={48}
                  height={48}
                  style={{ imageRendering: "pixelated" }}
                  alt=""
                />
              )}
            </div>
          ))
        )}
      </div>

      {gameOver && (
        <div className="mt-4 text-red-500 text-xl font-bold">
          U didn't make Super Computer
        </div>
      )}
      {win && (
        <div className="mt-4 text-green-400 text-xl font-bold">
          U made Super Computer!
        </div>
      )}

      {/* full-screen video overlay on win */}
      {win && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setWin(false)}
          >
            ×
          </button>
          <video
            src="/assets/intro.mp4"
            autoPlay
            muted
            className="absolute inset-0 w-full h-full object-cover"
            onEnded={() => setWin(false)}
          />
        </div>
      )}

      {/* restart button */}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        onClick={restart}
      >
        Restart
      </button>

      <div className="mt-2 text-sm text-gray-500">Use arrow keys to play.</div>
    </div>
  );
}
