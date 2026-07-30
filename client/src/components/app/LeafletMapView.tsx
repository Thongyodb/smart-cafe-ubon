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

const DEFAULT_ZOOM = 13;
const USER_ZOOM = 13;
const MAX_FIT_ZOOM = 14;
const MIN_MAP_ZOOM = 10;
const MAX_MAP_ZOOM = 17;

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

const isValidPoint = (
  point: MapPoint | null | undefined
): point is MapPoint => {
  return (
    point !== null &&
    point !== undefined &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  );
};

function MapController({
  cafes,
  userLocation,
  center,
}: {
  cafes: Cafe[];
  userLocation?: MapPoint | null;
  center: MapPoint;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map, cafes.length]);

  useEffect(() => {
    const points: MapPoint[] = cafes
      .filter(
        (cafe) =>
          Number.isFinite(cafe.latitude) && Number.isFinite(cafe.longitude)
      )
      .map((cafe) => ({
        lat: cafe.latitude,
        lng: cafe.longitude,
      }));

    if (isValidPoint(userLocation)) {
      points.push(userLocation);
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(
        points.map((point) => [point.lat, point.lng] as [number, number])
      );

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: MAX_FIT_ZOOM,
        animate: true,
      });

      return;
    }

    map.setView(
      [center.lat, center.lng],
      isValidPoint(userLocation) ? USER_ZOOM : DEFAULT_ZOOM,
      {
        animate: true,
      }
    );
  }, [map, cafes, userLocation, center]);

  return null;
}

function LeafletMapView({ cafes, userLocation, height = "100%" }: Props) {
  const validCafes = useMemo(() => {
    return cafes.filter(
      (cafe) =>
        Number.isFinite(cafe.latitude) && Number.isFinite(cafe.longitude)
    );
  }, [cafes]);

  const mapCenter: MapPoint = useMemo(() => {
    if (isValidPoint(userLocation)) {
      return userLocation;
    }

    const firstCafe = validCafes[0];

    if (firstCafe) {
      return {
        lat: firstCafe.latitude,
        lng: firstCafe.longitude,
      };
    }

    return UBON_CENTER;
  }, [validCafes, userLocation]);

  return (
    <div className="leaflet-map-shell" style={{ height }}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_MAP_ZOOM}
        maxZoom={MAX_MAP_ZOOM}
        scrollWheelZoom
        zoomControl
        preferCanvas
        className="leaflet-map"
      >
        <MapController
          cafes={validCafes}
          userLocation={userLocation}
          center={mapCenter}
        />

        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          minZoom={MIN_MAP_ZOOM}
          maxNativeZoom={17}
          maxZoom={MAX_MAP_ZOOM}
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={4}
        />

        {isValidPoint(userLocation) && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userMarkerIcon}
          >
            <Popup>
              <div className="leaflet-popup-content-custom">
                <h3>ตำแหน่งของคุณ</h3>
                <p>ระบบใช้ตำแหน่งนี้เพื่อค้นหาร้านใกล้คุณ</p>
              </div>
            </Popup>
          </Marker>
        )}

        {validCafes.map((cafe) => (
          <Marker
            key={cafe.id}
            position={[cafe.latitude, cafe.longitude]}
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