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
      2: "#FF6B6B",      // Vibrant Red
      4: "#FF8E72",      // Coral
      8: "#FFB347",      // Orange
      16: "#FFD93D",     // Golden Yellow
      32: "#6BCB77",     // Bright Green
      64: "#4D96FF",     // Bright Blue
      128: "#A78BFA",    // Purple
      256: "#F472B6",    // Pink
      512: "#06B6D4",    // Cyan
      1024: "#EC4899",   // Hot Pink
      2048: "#FBBF24",   // Bright Amber
    }
    return colors[value] || "#EC4899"
  }

  const getTileTextColor = (value: number) => {
    // Dark text for bright tiles, white for darker tiles
    const darkTextValues = [16, 32, 64, 128, 256, 512, 1024, 2048]
    return darkTextValues.includes(value) ? "#1F2937" : "#FFFFFF"
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
    <div className="flex flex-col items-center gap-6 w-full px-2">
      <WalletConnect />

      {/* Score Board - Vibrant Style */}
      <div className="flex gap-4 sm:gap-6 w-full justify-center flex-wrap">
        <div className="rounded-xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF8E72]/20 dark:from-[#FF6B6B]/30 dark:to-[#FF8E72]/30 backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-5 text-center shadow-xl border-2 border-[#FF6B6B] dark:border-[#FF8E72]">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#FF6B6B] dark:text-[#FF8E72] tracking-widest">
            Score
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#FF6B6B] dark:text-[#FBBF24]">{score}</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#6BCB77]/20 to-[#4D96FF]/20 dark:from-[#6BCB77]/30 dark:to-[#4D96FF]/30 backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-5 text-center shadow-xl border-2 border-[#6BCB77] dark:border-[#4D96FF]">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#6BCB77] dark:text-[#4D96FF] tracking-widest">
            Best
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#6BCB77] dark:text-[#06B6D4]">{bestScore}</div>
        </div>
      </div>

      {/* Game Grid - Vibrant Layout */}
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur p-4 sm:p-5 md:p-6 shadow-2xl border-3 border-slate-200 dark:border-slate-700 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid gap-2 sm:gap-2.5 md:gap-3 w-full aspect-square"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            maxHeight: "100%",
          }}
        >
          {/* Only render tiles that exist in the game - no extra background tiles */}
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`font-black flex items-center justify-center transition-all duration-150 shadow-xl text-center rounded-xl
                ${tile.isNew ? "animate-fade-in" : ""} 
                ${tile.isMerged ? "animate-bounce-in" : ""}
              `}
              style={{
                backgroundColor: getTileColor(tile.value),
                color: getTileTextColor(tile.value),
                gridColumn: tile.position.col + 1,
                gridRow: tile.position.row + 1,
                fontSize: tile.value >= 1000 ? "0.85rem" : tile.value >= 100 ? "1.1rem" : "1.5rem",
                fontWeight: "900",
                lineHeight: "1.2",
                border: `3px solid ${getTileColor(tile.value)}`,
                boxShadow: `0 8px 16px ${getTileColor(tile.value)}40, inset 0 -2px 4px rgba(0,0,0,0.2)`,
              }}
            >
              {tile.value}
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/85 backdrop-blur-md border-3 border-[#FF6B6B]">
            <div className="text-center px-4">
              <div className="mb-6 text-4xl sm:text-6xl font-black text-[#FF6B6B] drop-shadow-lg">
                Game Over!
              </div>
              <p className="mb-6 text-sm sm:text-base text-slate-200">Final Score: <span className="font-bold text-[#FBBF24]">{score}</span></p>
              <button
                onClick={() => onNewGame?.()}
                className="rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E72] hover:from-[#FF5252] hover:to-[#FF6B6B] px-8 sm:px-10 py-3 sm:py-4 font-bold text-white transition-all shadow-lg text-base sm:text-lg border-2 border-[#FF6B6B]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {hasWon && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/85 backdrop-blur-md border-3 border-[#FBBF24]">
            <div className="text-center px-4">
              <div className="mb-6 text-4xl sm:text-6xl font-black text-[#FBBF24] drop-shadow-lg">
                You Win!
              </div>
              <p className="mb-6 text-sm sm:text-base text-slate-200">Score: <span className="font-bold text-[#06B6D4]">{score}</span></p>
              <button
                onClick={() => setHasWon(false)}
                className="rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#FFD93D] hover:from-[#FFB700] hover:to-[#FBBF24] px-8 sm:px-10 py-3 sm:py-4 font-bold text-black transition-all shadow-lg text-base sm:text-lg border-2 border-[#FBBF24]"
              >
                Keep Playing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center w-full px-2">
        <p className="mb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">Use arrow keys or swipe to play</p>
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
          <button
            onClick={() => onNewGame?.()}
            className="rounded-xl bg-gradient-to-r from-[#4D96FF] to-[#A78BFA] hover:from-[#3B82FF] hover:to-[#7C3AED] px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white transition-all shadow-lg border-2 border-[#4D96FF]"
          >
            New Game
          </button>
          <ShareButton score={score} sdk={sdk} />
        </div>
      </div>
    </div>
  )
}
