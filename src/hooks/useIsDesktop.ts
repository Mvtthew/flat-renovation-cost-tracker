import { useEffect, useState } from 'react'

const QUERY = '(min-width: 768px)'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    const listener = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return isDesktop
}
