export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekStartString(date: Date = new Date()): string {
  const weekStart = getWeekStart(date)
  return weekStart.toISOString().split("T")[0]
}

export function isNewWeek(lastRefresh: Date): boolean {
  const now = new Date()
  // Convert to UTC+5:30
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)

  // Check if it's Sunday in IST
  if (istTime.getDay() !== 0) return false

  // Check if last refresh was before this Sunday
  const lastRefreshIST = new Date(lastRefresh.getTime() + 5.5 * 60 * 60 * 1000)
  return lastRefreshIST.getDay() !== 0 || istTime.getTime() - lastRefresh.getTime() < 24 * 60 * 60 * 1000
}

export function formatAddress(address: string): string {
  if (!address) return "Anonymous"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
