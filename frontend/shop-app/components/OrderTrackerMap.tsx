"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { sellerService, shipperService, userService } from './providers'
import { MapPin, Truck, Store, Loader2 } from 'lucide-react'

// Fix Default Icon paths for Leaflet in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})
const shipperIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})

function MapBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coords, map])
  return null
}

export default function OrderTrackerMap({ 
  sellerId, 
  shipperId, 
  userId 
}: { 
  sellerId: number, 
  shipperId?: number | null, 
  userId: number 
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [coords, setCoords] = useState<{
    seller: [number, number] | null,
    shipper: [number, number] | null,
    user: [number, number] | null
  }>({ seller: null, shipper: null, user: null })

  const [routeData, setRouteData] = useState<{
    distance: string,
    duration: string,
    path: [number, number][]
  }>({ distance: '', duration: '', path: [] })

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const [sellerData, shipperData, userData] = await Promise.all([
          sellerService.getById(sellerId).catch(() => null),
          shipperId ? shipperService.getById(shipperId).catch(() => null) : Promise.resolve(null),
          userService.getById(userId).catch(() => null)
        ])

        const sellerPos: [number, number] | null = sellerData?.latitude && sellerData?.longitude ? [sellerData.latitude, sellerData.longitude] : null
        const shipperPos: [number, number] | null = shipperData?.latitude && shipperData?.longitude ? [shipperData.latitude, shipperData.longitude] : null
        const userPos: [number, number] | null = userData?.latitude && userData?.longitude ? [userData.latitude, userData.longitude] : null

        setCoords({ seller: sellerPos, shipper: shipperPos, user: userPos })

        // If we have at least seller and user, draw OSRM route
        if (sellerPos && userPos) {
          try {
            // Longitude comes first for OSRM: lon,lat
            const startNode = shipperPos ? shipperPos : sellerPos
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startNode[1]},${startNode[0]};${userPos[1]},${userPos[0]}?overview=full&geometries=geojson`
            
            const res = await fetch(osrmUrl)
            const data = await res.json()
            
            if (data.code === 'Ok' && data.routes.length > 0) {
              const route = data.routes[0]
              const distanceKm = (route.distance / 1000).toFixed(1)
              const durationMin = Math.ceil(route.duration / 60)
              
              // GeoJSON path is [lng, lat], Leaflet needs [lat, lng]
              const path: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
              setRouteData({ distance: `${distanceKm} km`, duration: `${durationMin} phút`, path })
            }
          } catch(e) {
            console.error("OSRM Routing Error", e)
          }
        } else {
          setError('Không đủ dữ liệu tọa độ của Cửa hàng hoặc Khách hàng để vẽ bản đồ.')
        }
      } catch (err) {
        setError('Lỗi khi tải dữ liệu tọa độ')
      } finally {
        setLoading(false)
      }
    }

    fetchCoords()
    
    // Auto refresh Shipper Location every 10 seconds if Shipper exists
    let interval: NodeJS.Timeout
    if (shipperId) {
      interval = setInterval(async () => {
        try {
          const sData = await shipperService.getById(shipperId)
          if (sData?.latitude && sData?.longitude) {
            setCoords(prev => ({ ...prev, shipper: [sData.latitude, sData.longitude] }))
          }
        } catch(e) {}
      }, 10000)
    }

    return () => clearInterval(interval)
  }, [sellerId, shipperId, userId])

  if (loading) return <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  if (error) return <div className="h-40 flex items-center justify-center bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>

  const validMarkers: [number, number][] = [coords.seller, coords.shipper, coords.user].filter(Boolean) as [number, number][]
  if (validMarkers.length === 0) {
    return <div className="h-40 flex items-center justify-center bg-slate-50 text-slate-500 rounded-xl text-sm">Chưa có thông tin cập nhật tọa độ</div>
  }

  return (
    <div className="flex flex-col gap-3">
      {routeData.distance && (
        <div className="flex items-center gap-4 text-sm font-medium bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Cách đích: {routeData.distance}</div>
          <div className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> ETA: {routeData.duration}</div>
        </div>
      )}
      
      <div className="h-80 w-full rounded-xl overflow-hidden border border-border shadow-sm">
        <MapContainer center={validMarkers[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {coords.seller && (
            <Marker position={coords.seller} icon={storeIcon}>
              <Popup><b>Cửa hàng</b><br/>Điểm gửi hàng</Popup>
            </Marker>
          )}
          
          {coords.user && (
            <Marker position={coords.user} icon={userIcon}>
              <Popup><b>Nhận hàng</b><br/>Vị trí của bạn</Popup>
            </Marker>
          )}

          {coords.shipper && (
            <Marker position={coords.shipper} icon={shipperIcon}>
              <Popup><b>Tài xế</b><br/>Vị trí đang giao</Popup>
            </Marker>
          )}

          {routeData.path.length > 0 && (
            <Polyline positions={routeData.path} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} />
          )}

          <MapBounds coords={validMarkers} />
        </MapContainer>
      </div>
    </div>
  )
}
