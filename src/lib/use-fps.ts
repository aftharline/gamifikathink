"use client"

import { useEffect, useState } from "react"

// Flag efek rendah: manual (localStorage lab-lowfx=1) ATAU FPS < 30 ATAU prefers-reduced-motion.
export function useLowFx(): boolean {
  const [low, setLow] = useState(false)
  /* eslint-disable react-hooks/set-state-in-effect -- inisialisasi flag sekali saat mount */
  useEffect(() => {
    try {
      if (localStorage.getItem("lab-lowfx") === "1") {
        setLow(true)
        return
      }
    } catch { /* abaikan */ }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLow(true)
      return
    }
    let frames = 0
    let raf = 0
    const t0 = performance.now()
    const loop = () => {
      frames++
      if (performance.now() - t0 >= 2000) {
        if (frames / 2 < 30) setLow(true)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */
  return low
}
