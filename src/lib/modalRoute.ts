import type { Location } from 'react-router-dom'

export interface BackgroundLocationState {
  backgroundLocation: Location
}

export function withBackground(location: Location): { state: BackgroundLocationState } {
  return { state: { backgroundLocation: location } }
}
