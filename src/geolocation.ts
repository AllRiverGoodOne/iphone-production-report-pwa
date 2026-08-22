export interface PositionResult {
  latitude: number | 'NA'
  longitude: number | 'NA'
  acquired: boolean
}

export function acquirePosition(): Promise<PositionResult> {
  if (!('geolocation' in navigator)) {
    return Promise.resolve({ latitude: 'NA', longitude: 'NA', acquired: false })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          acquired: true,
        })
      },
      () => resolve({ latitude: 'NA', longitude: 'NA', acquired: false }),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    )
  })
}
