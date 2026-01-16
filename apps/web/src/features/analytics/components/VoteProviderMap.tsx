import { cn } from "@chatwar/ui";
import { ExternalLink } from "@/components/ExternalLink";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_KEY_URL = "https://developers.google.com/maps/documentation/javascript/get-api-key";

export function VoteProviderMap({ className }: { className?: string }) {
  // return a prompt if the API key is not set
  if (!MAPS_API_KEY) {
    return (
      <div className={cn("items-center justify-center", className)}>
        <p>
          Get your Google Maps API Key <ExternalLink href={MAP_KEY_URL}>here</ExternalLink>.
          <br />
          Set your VITE_GOOGLE_MAPS_API_KEY in <em>.env.local</em>
        </p>
      </div>
    );
  }

  // return the map
  return <div className={cn("p-2 items-center justify-center", className)}>TODO: Map</div>;
}
