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

type FarcasterSDK = {
  actions: {
    composeCast: (options: { body: string }) => Promise<void>
  }
}

const GRID_SIZE = 4

export default function Game2048({
  sdk,
  fid,
  address,
  onNewGame,
}: { sdk: FarcasterSDK | null; fid: number | null; address: string | null; onNewGame?: () => void }) {
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
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameOver || isProcessing) return
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isProcessing) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const dx = touchEnd.x - touchStart.x
    const dy = touchEnd.y - touchStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const MIN_SWIPE_DISTANCE = 50
    if (distance < MIN_SWIPE_DISTANCE) {
      setTouchStart(null)
      return
    }

    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 150)

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

  // API integration for score submission
  const submitScore = async (finalScore: number) => {
    if (finalScore === 0) return

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: address || "Anonymous",
          farcaster_username: fid ? `User ${fid}` : null,
          fid: fid,
          score: finalScore,
        }),
      })

      if (response.ok) {
        console.log("[v0] Score submitted to weekly leaderboard")
      }
    } catch (error) {
      console.error("[v0] Failed to submit score:", error)
    }
  }

  useEffect(() => {
    if (gameOver && score > 0) {
      submitScore(score)
    }
  }, [gameOver, score])

  return (
    <div className="flex flex-col items-center gap-4 w-full px-2">
      <WalletConnect />

      {/* Score Board */}
      <div className="flex gap-4 sm:gap-6 w-full justify-center flex-wrap">
        <div className="rounded-lg bg-gradient-to-b from-[#bbada0] to-[#a89892] px-6 sm:px-8 py-3 sm:py-4 text-center shadow-lg border-2 border-[#8f7a66]">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#f9f6f2] tracking-widest">Score</div>
          <div className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">{score}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-b from-[#bbada0] to-[#a89892] px-6 sm:px-8 py-3 sm:py-4 text-center shadow-lg border-2 border-[#8f7a66]">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#f9f6f2] tracking-widest">Best</div>
          <div className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">{bestScore}</div>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-xl bg-gradient-to-b from-[#c2b3a9] to-[#bbada0] p-2 sm:p-3 md:p-4 shadow-2xl border-4 border-[#8f7a66] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 aspect-square">
          {/* Background tiles */}
          {Array(16)
            .fill(0)
            .map((_, i) => (
              <div key={`bg-${i}`} className="rounded-md sm:rounded-lg bg-[#cdc1b4]/70 shadow-inner" />
            ))}

          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`rounded-md sm:rounded-lg font-bold flex items-center justify-center transition-all duration-200 shadow-lg text-center
                ${tile.isNew ? "animate-fade-in" : ""} 
                ${tile.isMerged ? "animate-bounce-in" : ""}
              `}
              style={{
                backgroundColor: getTileColor(tile.value),
                color: getTileTextColor(tile.value),
                gridColumn: tile.position.col + 1,
                gridRow: tile.position.row + 1,
                fontSize: tile.value >= 1000 ? "0.75rem" : tile.value >= 100 ? "1rem" : "1.25rem",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                lineHeight: "1.2",
              }}
            >
              {tile.value}
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">Game Over!</div>
              <button
                onClick={() => onNewGame?.()}
                className="rounded-lg bg-gradient-to-b from-[#f67c5f] to-[#f65e3b] px-6 sm:px-8 py-3 sm:py-4 font-bold text-white transition-all hover:from-[#f68d6b] hover:to-[#f76b47] shadow-lg text-base sm:text-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {hasWon && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#edc22e]/95 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">You Win!</div>
              <button
                onClick={() => setHasWon(false)}
                className="rounded-lg bg-gradient-to-b from-[#8f7a66] to-[#6f5a4f] px-6 sm:px-8 py-3 sm:py-4 font-bold text-white transition-all hover:from-[#9f8a76] hover:to-[#7f6a5f] shadow-lg text-base sm:text-lg"
              >
                Keep Playing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center w-full px-2">
        <p className="mb-3 text-xs sm:text-sm text-[#776e65] font-semibold">Use arrow keys or swipe to play</p>
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
          <button
            onClick={() => onNewGame?.()}
            className="rounded-lg bg-gradient-to-b from-[#8f7a66] to-[#6f5a4f] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-all hover:from-[#9f8a76] hover:to-[#7f6a5f] shadow-lg"
          >
            New Game
          </button>
          <ShareButton score={score} sdk={sdk} />
        </div>
      </div>
    </div>
  )
}
