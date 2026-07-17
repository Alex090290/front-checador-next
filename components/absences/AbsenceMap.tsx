// components/CheckLocationMap.tsx
"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface CheckLocationMapProps {
    lat: number;
    lng: number;
}

export default function CheckLocationMap({ lat, lng }: CheckLocationMapProps) {

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    });

    if (!isLoaded) {
        return (
            <div
                className="d-flex align-items-center justify-content-center bg-light rounded-3 h-100"
                style={{ minHeight: "180px" }}
            >
                <div className="spinner-border spinner-border-sm text-primary" />
            </div>
        );
    }

    const position = { lat, lng };

    return (
        <GoogleMap
            center={position}
            zoom={16}
            mapContainerStyle={{
                width: "100%",
                height: "100%",
                minHeight: "180px",
                borderRadius: "0.5rem",
            }}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            <Marker position={position} />
        </GoogleMap>
    );
}