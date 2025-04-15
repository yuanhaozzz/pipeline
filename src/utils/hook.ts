import { useState, useEffect } from 'react'

export function useScreenHeight(heightPercentage: number) {

  const [height, setHeight] = useState(window.innerHeight * heightPercentage)

  useEffect(() => {
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  const resize = () => {
    setHeight(window.innerHeight * heightPercentage)
  }

  return height
}