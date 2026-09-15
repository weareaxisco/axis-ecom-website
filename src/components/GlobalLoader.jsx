import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import LoadingScreen from './LoadingScreen'

export default function GlobalLoader() {
  const { loading } = useSiteConfigSettings()
  const { pathname } = useLocation()
  const [routeLoading, setRouteLoading] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [fading, setFading] = useState(false)
  const [visible, setVisible] = useState(true)
  const hasMounted = useRef(false)
  const startedAt = useRef(Date.now())
  const finishTimer = useRef(null)

  const finish = useCallback(() => {
    if (finishTimer.current) return
    setFading(true)
    finishTimer.current = window.setTimeout(() => {
      setVisible(false)
      hasMounted.current = true
    }, 400)
  }, [])
  const handlePreloadComplete = useCallback(() => setAssetsReady(true), [])

  useEffect(() => {
    const ceilingTimer = window.setTimeout(finish, 2500)
    return () => window.clearTimeout(ceilingTimer)
  }, [finish])

  useEffect(() => {
    if (loading || !assetsReady) return undefined
    const remainingFloor = Math.max(0, 800 - (Date.now() - startedAt.current))
    const floorTimer = window.setTimeout(finish, remainingFloor)
    return () => window.clearTimeout(floorTimer)
  }, [assetsReady, finish, loading])

  useEffect(() => {
    if (loading) return undefined
    if (!hasMounted.current) {
      hasMounted.current = true
      return undefined
    }
    setRouteLoading(true)
    const timer = window.setTimeout(() => setRouteLoading(false), 220)
    return () => window.clearTimeout(timer)
  }, [pathname, loading])
  useEffect(() => () => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current)
  }, [])
  if ((!visible && !routeLoading) || (!loading && !routeLoading && hasMounted.current)) return null
  return <div className="fixed inset-0 z-[100]"><LoadingScreen fading={fading} onPreloadComplete={handlePreloadComplete} /></div>
}
