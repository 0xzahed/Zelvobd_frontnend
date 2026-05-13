"use client"

import Lottie from "lottie-react"
import tickAnimation from "@/public/tick_aniamtion.json"

export function TickLottie() {
  return (
    <div className="h-24 w-24">
      <Lottie animationData={tickAnimation} loop={false} autoplay={true} />
    </div>
  )
}
