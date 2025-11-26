"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import ShareButton from "./ShareButton"
import WalletConnect from "./WalletConnect"

type Tile = {
  id: number
  value: number
  position: { row: number; col: number }
  isNew?: boolean
  isMerged?: boolean
}

const GRID_SIZE = 4

export default function Game2048({ isSDKLoaded }: { isSDKLoaded: boolean }) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [nextId, setNextId] = useState(0)

  // Initialize game
  const initGame = useCallback(() => {
    const newTiles: Tile[] = []
    let id = 0

    // Add two initial tiles
    for (let i = 0; i < 2; i++) {
      const position = getRandomEmptyPosition([])
      newTiles.push({
        id: id++,
        value: Math.random() < 0.9 ? 2 : 4,
        position,
        isNew: true,
      })
    }

    setTiles(newTiles)
    setNextId(id)
    setScore(0)
    setGameOver(false)
    setHasWon(false)
  }, [])

  // Get random empty position
  const getRandomEmptyPosition = (currentTiles: Tile[]) => {
    const occupied = new Set(currentTiles.map((t) => `${t.position.row},${t.position.col}`))
    const empty: { row: number; col: number }[] = []

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!occupied.has(`${row},${col}`)) {
          empty.push({ row, col })
        }
      }
    }

    return empty[Math.floor(Math.random() * empty.length)]
  }

  // Handle keyboard input
  const handleMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameOver) return

      let moved = false
      let newScore = score
      const grid: (Tile | null)[][] = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(null))

      // Place tiles in grid
      tiles.forEach((tile) => {
        grid[tile.position.row][tile.position.col] = { ...tile, isMerged: false, isNew: false }
      })

      // Define traversal order based on direction
      const vectors: Record<string, { row: number; col: number }> = {
        up: { row: -1, col: 0 },
        down: { row: 1, col: 0 },
        left: { row: 0, col: -1 },
        right: { row: 0, col: 1 },
      }

      const vector = vectors[direction]
      const traversals = {
        rows: vector.row === 1 ? [3, 2, 1, 0] : [0, 1, 2, 3],
        cols: vector.col === 1 ? [3, 2, 1, 0] : [0, 1, 2, 3],
      }

      const newTiles: Tile[] = []

      // Move tiles
      traversals.rows.forEach((row) => {
        traversals.cols.forEach((col) => {
          const tile = grid[row][col]
          if (!tile) return

          let newRow = row
          let newCol = col

          // Find farthest position
          while (true) {
            const nextRow = newRow + vector.row
            const nextCol = newCol + vector.col

            if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) break
            if (grid[nextRow][nextCol] !== null) break

            newRow = nextRow
            newCol = nextCol
          }

          // Check for merge
          const nextRow = newRow + vector.row
          const nextCol = newCol + vector.col
          const nextTile =
            nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE ? grid[nextRow][nextCol] : null

          if (nextTile && nextTile.value === tile.value && !nextTile.isMerged) {
            // Merge tiles
            newRow = nextRow
            newCol = nextCol
            const mergedValue = tile.value * 2
            newScore += mergedValue

            if (mergedValue === 2048 && !hasWon) {
              setHasWon(true)
            }

            grid[nextRow][nextCol] = {
              ...tile,
              value: mergedValue,
              position: { row: newRow, col: newCol },
              isMerged: true,
            }
            grid[row][col] = null
            moved = true
          } else if (newRow !== row || newCol !== col) {
            // Move tile
            grid[newRow][newCol] = {
              ...tile,
              position: { row: newRow, col: newCol },
            }
            grid[row][col] = null
            moved = true
          }
        })
      })

      // Collect all tiles from grid
      grid.forEach((row) => {
        row.forEach((tile) => {
          if (tile) newTiles.push(tile)
        })
      })

      if (moved) {
        // Add new tile
        const emptyPosition = getRandomEmptyPosition(newTiles)
        if (emptyPosition) {
          newTiles.push({
            id: nextId,
            value: Math.random() < 0.9 ? 2 : 4,
            position: emptyPosition,
            isNew: true,
          })
          setNextId(nextId + 1)
        }

        setTiles(newTiles)
        setScore(newScore)
        if (newScore > bestScore) {
          setBestScore(newScore)
        }

        // Check game over
        if (!canMove(newTiles)) {
          setGameOver(true)
        }
      }
    },
    [tiles, score, gameOver, nextId, bestScore, hasWon],
  )

  // Check if any moves are possible
  const canMove = (currentTiles: Tile[]) => {
    // Check for empty cells
    if (currentTiles.length < GRID_SIZE * GRID_SIZE) return true

    // Check for possible merges
    const grid: (number | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))
    currentTiles.forEach((tile) => {
      grid[tile.position.row][tile.position.col] = tile.value
    })

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const value = grid[row][col]
        if (value === null) continue

        // Check adjacent cells
        if (col < GRID_SIZE - 1 && grid[row][col + 1] === value) return true
        if (row < GRID_SIZE - 1 && grid[row + 1][col] === value) return true
      }
    }

    return false
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        const direction = e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right"
        handleMove(direction)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleMove])

  // Touch controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const dx = touchEnd.x - touchStart.x
    const dy = touchEnd.y - touchStart.y

    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? "right" : "left")
    } else {
      handleMove(dy > 0 ? "down" : "up")
    }

    setTouchStart(null)
  }

  useEffect(() => {
    initGame()
  }, [initGame])

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    }
    return colors[value] || "#3c3a32"
  }

  const getTileTextColor = (value: number) => {
    return value <= 4 ? "#776e65" : "#f9f6f2"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletConnect />

      {/* Score Board */}
      <div className="flex gap-4">
        <div className="rounded-lg bg-[#bbada0] px-6 py-3 text-center">
          <div className="text-xs font-bold uppercase text-[#eee4da]">Score</div>
          <div className="text-2xl font-bold text-white">{score}</div>
        </div>
        <div className="rounded-lg bg-[#bbada0] px-6 py-3 text-center">
          <div className="text-xs font-bold uppercase text-[#eee4da]">Best</div>
          <div className="text-2xl font-bold text-white">{bestScore}</div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative rounded-lg bg-[#bbada0] p-3" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="grid grid-cols-4 gap-3">
          {Array(16)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-md bg-[#cdc1b4]/50 sm:h-20 sm:w-20 md:h-24 md:w-24" />
            ))}
        </div>

        {/* Tiles */}
        <div className="absolute inset-3">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`absolute flex h-16 w-16 items-center justify-center rounded-md font-bold transition-all duration-150 sm:h-20 sm:w-20 md:h-24 md:w-24 ${
                tile.isNew ? "animate-fade-in" : ""
              } ${tile.isMerged ? "animate-bounce-in" : ""}`}
              style={{
                backgroundColor: getTileColor(tile.value),
                color: getTileTextColor(tile.value),
                transform: `translate(${tile.position.col * 100}%, ${tile.position.row * 100}%)`,
                fontSize: tile.value >= 1000 ? "1.5rem" : tile.value >= 100 ? "2rem" : "2.5rem",
              }}
            >
              {tile.value}
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#faf8ef]/90">
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-[#776e65]">Game Over!</div>
              <button
                onClick={initGame}
                className="rounded-lg bg-[#8f7a66] px-6 py-3 font-bold text-white transition-colors hover:bg-[#9f8a76]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {hasWon && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#edc22e]/90">
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-white">You Win! 🎉</div>
              <button
                onClick={() => setHasWon(false)}
                className="rounded-lg bg-[#8f7a66] px-6 py-3 font-bold text-white transition-colors hover:bg-[#9f8a76]"
              >
                Keep Playing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center">
        <p className="mb-2 text-sm text-[#776e65]">Use arrow keys or swipe to play</p>
        <div className="flex gap-2">
          <button
            onClick={initGame}
            className="rounded-lg bg-[#8f7a66] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9f8a76]"
          >
            New Game
          </button>
          <ShareButton score={score} isSDKLoaded={isSDKLoaded} />
        </div>
      </div>
    </div>
  )
}
