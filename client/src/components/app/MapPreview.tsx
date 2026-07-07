function MapPreview() {
  return (
    <div className="map-preview">
      <div className="map-river" />
      <div className="map-road map-road-1" />
      <div className="map-road map-road-2" />
      <div className="map-road map-road-3" />

      <div className="map-pin pin-1">☕</div>
      <div className="map-pin pin-2">📍</div>
      <div className="map-pin pin-3">🍰</div>
      <div className="map-pin pin-4">📷</div>
      <div className="map-pin pin-5">☕</div>

      <button className="map-control map-plus" type="button">
        +
      </button>
      <button className="map-control map-minus" type="button">
        −
      </button>
    </div>
  );
}

export default MapPreview;