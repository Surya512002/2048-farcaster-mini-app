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
      2: "#4dd9ff",
      4: "#4dd9ff",
      8: "#00d4ff",
      16: "#00d4ff",
      32: "#ff00ff",
      64: "#ff00ff",
      128: "#ff00ff",
      256: "#ff00ff",
      512: "#00ffff",
      1024: "#00ffff",
      2048: "#ffff00",
    }
    return colors[value] || "#6600ff"
  }

  const getTileTextColor = (value: number) => {
    return "#ffffff"
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

      {/* Score Board - Neon Style */}
      <div className="flex gap-4 sm:gap-6 w-full justify-center flex-wrap">
        <div className="rounded-lg bg-[#1a0033]/80 backdrop-blur px-6 sm:px-8 py-3 sm:py-4 text-center shadow-lg border-2 border-[#ff00ff] glow-neon-purple">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#ff00ff] tracking-widest drop-shadow-lg">
            Score
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-[#00ffff] drop-shadow-lg">{score}</div>
        </div>
        <div className="rounded-lg bg-[#1a0033]/80 backdrop-blur px-6 sm:px-8 py-3 sm:py-4 text-center shadow-lg border-2 border-[#00ffff] glow-neon-cyan">
          <div className="text-xs sm:text-sm font-bold uppercase text-[#00ffff] tracking-widest drop-shadow-lg">
            Best
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-[#00ffff] drop-shadow-lg">{bestScore}</div>
        </div>
      </div>

      {/* Game Grid - Hexagonal Layout */}
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl bg-[#0a0e27]/90 backdrop-blur p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-[#4dd9ff] overflow-hidden glow-neon-cyan"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid gap-2 sm:gap-3 md:gap-4 aspect-square"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
          }}
        >
          {/* Background hex tiles */}
          {Array(16)
            .fill(0)
            .map((_, i) => (
              <div
                key={`bg-${i}`}
                className="hexagon-tile bg-[#1a0a2e]/60 border-2 border-[#4dd9ff]/30 rounded-full flex items-center justify-center"
              />
            ))}

          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`hexagon-tile font-bold flex items-center justify-center transition-all duration-200 shadow-lg text-center glow-neon
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
                textShadow: `0 0 10px ${getTileColor(tile.value)}, 0 2px 4px rgba(0,0,0,0.5)`,
                lineHeight: "1.2",
                border: `2px solid ${getTileColor(tile.value)}`,
                borderRadius: "50%",
                boxShadow: `0 0 20px ${getTileColor(tile.value)}, inset 0 0 10px ${getTileColor(tile.value)}`,
              }}
            >
              {tile.value}
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm border-2 border-[#ff00ff]">
            <div className="text-center">
              <div className="mb-4 text-3xl sm:text-5xl font-bold text-[#ff00ff] drop-shadow-lg glow-text">
                Game Over!
              </div>
              <button
                onClick={() => onNewGame?.()}
                className="rounded-lg bg-[#ff00ff]/80 hover:bg-[#ff00ff] px-6 sm:px-8 py-3 sm:py-4 font-bold text-white transition-all shadow-lg text-base sm:text-lg glow-neon-purple border-2 border-[#ff00ff]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {hasWon && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#ffff00]/20 backdrop-blur-sm border-2 border-[#ffff00]">
            <div className="text-center">
              <div className="mb-4 text-3xl sm:text-5xl font-bold text-[#ffff00] drop-shadow-lg glow-text">
                You Win!
              </div>
              <button
                onClick={() => setHasWon(false)}
                className="rounded-lg bg-[#ffff00]/80 hover:bg-[#ffff00] px-6 sm:px-8 py-3 sm:py-4 font-bold text-black transition-all shadow-lg text-base sm:text-lg glow-neon-yellow border-2 border-[#ffff00]"
              >
                Keep Playing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center w-full px-2">
        <p className="mb-3 text-xs sm:text-sm text-[#4dd9ff] font-semibold">Use arrow keys or swipe to play</p>
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
          <button
            onClick={() => onNewGame?.()}
            className="rounded-lg bg-[#4d00ff]/80 hover:bg-[#6600ff] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-all shadow-lg glow-neon-purple border-2 border-[#4d00ff]"
          >
            New Game
          </button>
          <ShareButton score={score} sdk={sdk} />
        </div>
      </div>
    </div>
  )
}
