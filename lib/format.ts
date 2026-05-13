export function formatBDT(amount: number | null | undefined): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0
  return `BDT ${value.toLocaleString("en-BD")}`
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return ""
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  if (diffMs < 0) return "Just now"

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffMonth > 0) {
    return `${diffMonth} Month${diffMonth > 1 ? "s" : ""} ago`
  }

  if (diffDay > 0) {
    const remHour = diffHour % 24
    if (remHour > 0) {
      return `${diffDay} Day${diffDay > 1 ? "s" : ""} ${remHour} Hour${remHour > 1 ? "s" : ""} ago`
    }
    return `${diffDay} Day${diffDay > 1 ? "s" : ""} ago`
  }

  if (diffHour > 0) {
    return `${diffHour} Hour${diffHour > 1 ? "s" : ""} ago`
  }

  if (diffMin > 0) {
    return `${diffMin} Minute${diffMin > 1 ? "s" : ""} ago`
  }

  return "Just now"
}
