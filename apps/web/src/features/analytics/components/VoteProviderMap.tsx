import React, { useEffect, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@chatwar/ui";
import { ExternalLink } from "@/components/ExternalLink";
import type { ProviderId, ProviderModelVoteResponse } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useAnalytics } from "@/providers/analytics";
import { toCssColor } from "@/utils/color";
import { toCommaList } from "@/utils/text";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_KEY_URL = "https://developers.google.com/maps/documentation/javascript/get-api-key";

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const MAP_ID_URL = "https://console.cloud.google.com/google/maps-apis/studio/maps/new";

type ProviderFilter = "winners" | "competitors";

// return an offset location to avoid marker overlap
function toMarkerLocation(latitude: number, longitude: number, seed: number) {
  const scale = 0.00005; // around 5 meters
  const offsetX = (((seed * 97) % 11) - 5) * scale;
  const offsetY = (((seed * 41) % 11) - 5) * scale;
  return { lat: latitude + offsetX, lng: longitude + offsetY };
}

// return the marker content element
function toMarkerContent(providerId: ProviderId) {
  const markerContainer = document.createElement("div");
  markerContainer.className = cn(
    "w-8 h-8 rounded-full bg-background flex items-center justify-center",
  );

  // give the marker a glow that matches the provider color
  const provider = PROVIDER_CONFIGURATIONS[providerId];
  const ring = toCssColor(provider.color);
  const glowStrong = toCssColor(provider.color, 0.7);
  const glowSoft = toCssColor(provider.color, 0.35);
  markerContainer.style.boxShadow = `
    0 0 0 2px ${ring},
    0 0 16px 6px ${glowStrong},
    0 0 32px 14px ${glowSoft},
    0 10px 22px rgba(0,0,0,0.18)
  `;

  // add the provider icon
  const iconContainer = document.createElement("div");
  iconContainer.innerHTML = provider.iconSvg;
  markerContainer.appendChild(iconContainer);
  markerContainer.title = `${provider.label}`;
  return markerContainer;
}

// return the marker click window content element
function toMarkerWindowContent(vote: ProviderModelVoteResponse) {
  // initialize provider labels
  const winner = PROVIDER_CONFIGURATIONS[vote.winnerProviderId].label;
  const competitors = new Set(
    vote.competitors.map((competitor) => {
      return PROVIDER_CONFIGURATIONS[competitor.providerId].label;
    }),
  );
  competitors.delete(winner);

  // return the window content
  return `
    <div style="
      color: #000;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 17px;
    ">
        <strong>${winner}</strong> beats ${toCommaList([...competitors])} 🏆
    </div>
  `;
}

export function VoteProviderMap({ className }: { className?: string }) {
  const { votes } = useAnalytics();
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("winners");

  // use refs to hold the map state without triggering re-renders
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Array<{ marker: google.maps.marker.AdvancedMarkerElement }>>([]);
  const markerWindowsRef = useRef<google.maps.InfoWindow | null>(null);

  // initialize an array of marker positions
  const markerPositions = useMemo(() => {
    const positions: Array<{
      key: string;
      position: { lat: number; lng: number };
      providerId: ProviderId;
      vote: ProviderModelVoteResponse;
    }> = [];

    // filter to get votes that have a location to show on the map
    const locationVotes = votes.filter(
      (
        vote,
      ): vote is ProviderModelVoteResponse & {
        latitude: number;
        longitude: number;
      } => {
        return typeof vote.latitude === "number" && typeof vote.longitude === "number";
      },
    );

    // push marker positions for votes with locations
    locationVotes.forEach((vote, voteIndex) => {
      // add winner markers
      const { latitude, longitude } = vote;
      if (providerFilter === "winners") {
        positions.push({
          key: `${vote.id}-winner-${vote.winnerProviderId}`,
          position: toMarkerLocation(latitude, longitude, voteIndex * 3),
          providerId: vote.winnerProviderId,
          vote,
        });
        return;
      }

      // or add competitor markers with the winner removed
      const competitorProviderIds = vote.competitors
        .map((competitor) => competitor.providerId)
        .filter((providerId) => providerId !== vote.winnerProviderId);
      competitorProviderIds.forEach((providerId, competitorIndex) => {
        positions.push({
          key: `${vote.id}-loser-${providerId}-${competitorIndex}`,
          position: toMarkerLocation(latitude, longitude, (voteIndex + competitorIndex) * 3),
          providerId,
          vote,
        });
      });
    });
    return positions;
  }, [votes, providerFilter]);

  // initialize the map when the marker positions are updated
  useEffect(() => {
    let cancelled = false;
    async function initializeMap() {
      if (!mapContainerRef.current) {
        return;
      }

      // initialize the map if it isn't in the ref yet
      if (!mapRef.current || !markerClustererRef.current) {
        setOptions({ key: MAPS_API_KEY });
        const googleMaps = (await importLibrary("maps")) as google.maps.MapsLibrary;
        await importLibrary("marker");
        if (cancelled) {
          return;
        }

        // set the default map
        const map = new googleMaps.Map(mapContainerRef.current, {
          center: { lat: 31.51073, lng: -96.4247 },
          zoom: 2,
          mapId: MAP_ID,
        });
        mapRef.current = map;
        markerClustererRef.current = new MarkerClusterer({
          map,
          markers: [],
        });

        // initialize the marker click windows
        markerWindowsRef.current = new google.maps.InfoWindow({ maxWidth: 300 });
        map.addListener("click", () => {
          const markerWindow = markerWindowsRef.current;
          if (!markerWindow) {
            return;
          }
          markerWindow.close();
        });
      }

      // wait for the map to load before adding markers
      const map = mapRef.current;
      const clusterer = markerClustererRef.current;
      if (!map || !clusterer) {
        return;
      }

      // clear old markers
      if (markersRef.current.length > 0) {
        clusterer.clearMarkers();
        markersRef.current.forEach(({ marker }) => {
          marker.map = null;
        });
        markersRef.current = [];
      }

      // add markers to the map clusterer
      const markers: google.maps.marker.AdvancedMarkerElement[] = [];
      markerPositions.forEach((markerPosition) => {
        const { providerId, vote, position } = markerPosition;
        const content = toMarkerContent(providerId);
        const marker = new google.maps.marker.AdvancedMarkerElement({ position, content });

        // add the marker window click listener
        marker.addListener("click", () => {
          const map = mapRef.current;
          const markerWindow = markerWindowsRef.current;
          if (!map || !markerWindow) {
            return;
          }
          markerWindow.setContent(toMarkerWindowContent(vote));
          markerWindow.open({ map, anchor: marker, shouldFocus: false });
        });
        markersRef.current.push({ marker });
        markers.push(marker);
      });
      clusterer.addMarkers(markers);

      // adjust the map bounds to contain its markers
      if (markerPositions.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markerPositions.forEach((marker) => {
          bounds.extend(marker.position);
        });
        map.fitBounds(bounds, 60);
      }
    }

    // cancel map initialization if the component unmounts
    void initializeMap();
    return () => {
      cancelled = true;
    };
  }, [markerPositions]);

  // return a prompt if the API key and map id were not set in the environment variables
  if (!MAPS_API_KEY || !MAP_ID) {
    return (
      <div className={cn("items-center justify-center", className)}>
        <ul className="list-disc list-inside space-y-4">
          <li>
            Get your Google Maps API Key <ExternalLink href={MAP_KEY_URL}>here</ExternalLink>.
            <span className="pl-5 block">
              Set your <code>VITE_GOOGLE_MAPS_API_KEY</code> in <em>.env.local</em>
            </span>
          </li>
          <li>
            Get your Google Maps ID <ExternalLink href={MAP_ID_URL}>here</ExternalLink>.
            <span className="pl-5 block">
              Set your <code>VITE_GOOGLE_MAPS_MAP_ID</code> in <em>.env.local</em>
            </span>
          </li>
        </ul>
      </div>
    );
  }

  // show the map
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -top-10 right-0 z-10">
        <Select
          value={providerFilter}
          onValueChange={(value) => setProviderFilter(value as ProviderFilter)}
        >
          <SelectTrigger className="h-8 cursor-pointer bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="winners" className="cursor-pointer">
              Winners
            </SelectItem>
            <SelectItem value="competitors" className="cursor-pointer">
              Competitors
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div ref={mapContainerRef} className={cn("w-full rounded-lg", className)} />
    </div>
  );
}
