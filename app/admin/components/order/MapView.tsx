import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

type Props = {
  address: string;
};

export default function MapView({ address }: Props) {
  // Tạm thời mock vị trí, bạn sẽ cần geocode sau
  const defaultPosition = {
    lat: 10.7769,
    lng: 106.7009,
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultPosition}
        zoom={14}
      >
        <Marker position={defaultPosition} />
      </GoogleMap>
    </LoadScript>
  );
}
