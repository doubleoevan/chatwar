import geoip from "geoip-lite";
import type { FastifyRequest } from "fastify";

// return the location of the request IP address
export function getLocation(request: FastifyRequest) {
  // read the ip address from proxy headers
  const ip = request.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ?? request.ip;
  if (!ip) {
    return {};
  }

  // look up the location
  const location = geoip.lookup(ip);
  if (!location) {
    return {};
  }

  // return the location data
  const [lat, lon] = location.ll ?? [];
  return {
    country: location.country,
    region: location.region,
    city: location.city,
    latitude: lat ?? undefined,
    longitude: lon ?? undefined,
  };
}
