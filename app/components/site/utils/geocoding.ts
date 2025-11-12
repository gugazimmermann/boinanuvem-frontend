import type { GeocodeResult, GeocodeError } from "~/types";

export type { GeocodeResult, GeocodeError };

export function buildAddressString(address: {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}): string {
  const parts: string[] = [];

  if (address.street) parts.push(address.street);
  if (address.number) parts.push(address.number);
  if (address.complement) parts.push(address.complement);
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);

  return parts.join(", ");
}

export async function geocodeAddress(address: {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<GeocodeResult | GeocodeError> {
  if (!address.street || !address.city || !address.state) {
    return { error: "Incomplete address" };
  }

  try {
    const street = `${address.street}${address.number ? ` ${address.number}` : ""}`;
    const city = address.city;
    const state = address.state;
    const country = "Brazil";

    const params = new URLSearchParams({
      format: "json",
      street: street,
      city: city,
      state: state,
      country: country,
      limit: "1",
      addressdetails: "1",
    });

    let url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    let response = await fetch(url, {
      headers: {
        "User-Agent": "BoiNaNuvem/1.0",
      },
    });

    if (!response.ok) {
      return { error: `Request error: ${response.statusText}` };
    }

    let data = await response.json();

    if (!data || data.length === 0) {
      const simpleAddress = `${street}, ${city}, ${state}, ${country}`;
      const encodedAddress = encodeURIComponent(simpleAddress);
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

      response = await fetch(url, {
        headers: {
          "User-Agent": "BoiNaNuvem/1.0",
        },
      });

      if (!response.ok) {
        return { error: `Erro na requisição: ${response.statusText}` };
      }

      data = await response.json();
    }

    if (!data || data.length === 0) {
      const minimalAddress = `${street}, ${city}, ${state}`;
      const encodedAddress = encodeURIComponent(minimalAddress);
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

      response = await fetch(url, {
        headers: {
          "User-Agent": "BoiNaNuvem/1.0",
        },
      });

      if (!response.ok) {
        return { error: `Erro na requisição: ${response.statusText}` };
      }

      data = await response.json();
    }

    if (!data || data.length === 0) {
      return { error: "Address not found" };
    }

    const result = data[0];
    return {
      lat: result.lat,
      lon: result.lon,
      display_name: result.display_name,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
