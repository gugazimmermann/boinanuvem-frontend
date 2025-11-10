/**
 * Geocoding utilities using OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface GeocodeError {
  error: string;
}

/**
 * Build a full address string from address components
 */
export function buildAddressString(address: {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}): string {
  const parts: string[] = [];

  if (address.rua) parts.push(address.rua);
  if (address.numero) parts.push(address.numero);
  if (address.complemento) parts.push(address.complemento);
  if (address.bairro) parts.push(address.bairro);
  if (address.cidade) parts.push(address.cidade);
  if (address.estado) parts.push(address.estado);
  if (address.cep) parts.push(address.cep);

  return parts.join(", ");
}

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * @param address - Address components
 * @returns Promise with latitude and longitude
 */
export async function geocodeAddress(
  address: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  }
): Promise<GeocodeResult | GeocodeError> {
  if (!address.rua || !address.cidade || !address.estado) {
    return { error: "Endereço incompleto" };
  }

  try {
    const street = `${address.rua}${address.numero ? ` ${address.numero}` : ""}`;
    const city = address.cidade;
    const state = address.estado;
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
        "User-Agent": "BoiNaNuvem/1.0", // Required by Nominatim usage policy
      },
    });

    if (!response.ok) {
      return { error: `Erro na requisição: ${response.statusText}` };
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
      return { error: "Endereço não encontrado" };
    }

    const result = data[0];
    return {
      lat: result.lat,
      lon: result.lon,
      display_name: result.display_name,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

