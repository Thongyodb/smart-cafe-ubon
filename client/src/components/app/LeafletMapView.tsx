import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Cafe } from "../../types/cafe";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type MapPoint = {
  lat: number;
  lng: number;
};

type Props = {
  cafes: Cafe[];
  userLocation?: MapPoint | null;
  height?: string;
};

const UBON_CENTER: MapPoint = {
  lat: 15.2287,
  lng: 104.8564,
};

const cafeMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userMarkerIcon = L.divIcon({
  className: "user-location-marker",
  html: "<span></span>",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapAutoCenter({
  center,
}: {
  center: MapPoint;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);

  return null;
}

function LeafletMapView({ cafes, userLocation, height = "100%" }: Props) {
  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }

    if (cafes.length > 0) {
      return {
        lat: cafes[0].latitude,
        lng: cafes[0].longitude,
      };
    }

    return UBON_CENTER;
  }, [cafes, userLocation]);

  return (
    <div className="leaflet-map-shell" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom
        className="leaflet-map"
      >
        <MapAutoCenter center={mapCenter} />

        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {userLocation && (
          <Marker position={userLocation} icon={userMarkerIcon}>
            <Popup>
              <div className="leaflet-popup-content-custom">
                <h3>ตำแหน่งของคุณ</h3>
                <p>ระบบใช้ตำแหน่งนี้เพื่อค้นหาร้านใกล้คุณ</p>
              </div>
            </Popup>
          </Marker>
        )}

        {cafes.map((cafe) => (
          <Marker
            key={cafe.id}
            position={{
              lat: cafe.latitude,
              lng: cafe.longitude,
            }}
            icon={cafeMarkerIcon}
          >
            <Popup>
              <div className="leaflet-popup-content-custom">
                <h3>{cafe.name}</h3>
                <p>{cafe.district.name}</p>

                {cafe.distanceKm !== undefined && (
                  <small>{cafe.distanceKm} km จากคุณ</small>
                )}

                <Link to={`/cafes/${cafe.id}`}>ดูรายละเอียดร้าน</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LeafletMapView;