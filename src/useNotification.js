import { useCallback } from 'react'

export function useNotification() {
  const requestPermission = useCallback(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const notify = useCallback(() => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    try {
      const n = new Notification('Time to water the next tree', {
        body: 'Move on to the next tree now.',
        tag: 'water-next-tree',
      })
      n.onclick = () => window.focus()
    } catch {
      // notification unavailable
    }
  }, [])

  return { requestPermission, notify }
}
