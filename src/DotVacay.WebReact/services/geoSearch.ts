export type DestinationCategory = 'country' | 'city' | 'landmark';

export interface GeoSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  category: DestinationCategory;
}

export interface CountryScope {
  countryCode: string;
  countryName: string;
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  address?: {
    country?: string;
    country_code?: string;
  };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const toParams = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

const fetchNominatim = async (path: string, params: Record<string, string | number | undefined>) => {
  const url = `${NOMINATIM_BASE_URL}${path}?${toParams(params)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed (${response.status})`);
  }

  return (await response.json()) as NominatimPlace[];
};

const classifyDestination = (item: NominatimPlace): DestinationCategory | null => {
  const klass = (item.class || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  if (type === 'country') return 'country';

  // Nominatim often returns major cities like "Rome" as administrative without class.
  if (!klass && type === 'administrative') return 'city';

  if (
    klass === 'place' &&
    ['city', 'town', 'village', 'municipality', 'hamlet', 'state', 'region', 'county', 'province'].includes(type)
  ) {
    return 'city';
  }

  if (
    ['tourism', 'historic', 'leisure', 'amenity', 'natural'].includes(klass) ||
    ['museum', 'attraction', 'monument', 'castle', 'memorial', 'ruins'].includes(type)
  ) {
    return 'landmark';
  }

  return null;
};

const isPoiLike = (item: NominatimPlace) => {
  const klass = (item.class || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  if (['amenity', 'tourism', 'leisure', 'shop', 'historic'].includes(klass)) return true;
  if (
    [
      'restaurant',
      'cafe',
      'museum',
      'hotel',
      'hostel',
      'bar',
      'pub',
      'fast_food',
      'attraction',
      'place_of_worship',
      'church',
      'cathedral',
      'monument',
      'memorial',
      'gallery',
      'zoo',
      'theme_park',
      'viewpoint'
    ].includes(type)
  ) {
    return true;
  }

  return false;
};

export const searchDestinationSuggestions = async (query: string): Promise<GeoSuggestion[]> => {
  if (!query || query.trim().length < 2) return [];

  const results = await fetchNominatim('/search', {
    q: query.trim(),
    format: 'jsonv2',
    addressdetails: 1,
    limit: 12,
    dedupe: 1
  });

  return results
    .map((item) => {
      const category = classifyDestination(item);
      if (!category) return null;
      return {
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        category
      } as GeoSuggestion;
    })
    .filter((item): item is GeoSuggestion => item !== null)
    .slice(0, 8);
};

export const searchPoiSuggestionsInCountry = async (query: string, countryCode: string): Promise<GeoSuggestion[]> => {
  if (!query || query.trim().length < 2 || !countryCode) return [];

  const normalizedCode = countryCode.trim().toLowerCase();
  const results = await fetchNominatim('/search', {
    q: query.trim(),
    format: 'jsonv2',
    addressdetails: 1,
    limit: 12,
    dedupe: 1,
    countrycodes: normalizedCode
  });

  return results
    .filter(isPoiLike)
    .map((item) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      category: 'landmark' as DestinationCategory
    }))
    .slice(0, 8);
};

export const resolveCountryScope = async (latitude?: number | null, longitude?: number | null, destination?: string): Promise<CountryScope | null> => {
  if (latitude && longitude) {
    const reverseUrl = `${NOMINATIM_BASE_URL}/reverse?${toParams({
      format: 'jsonv2',
      lat: latitude,
      lon: longitude,
      zoom: 5,
      addressdetails: 1
    })}`;
    const reverseResponse = await fetch(reverseUrl, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (reverseResponse.ok) {
      const payload = (await reverseResponse.json()) as NominatimPlace;
      const code = payload.address?.country_code?.toLowerCase();
      if (code) {
        return {
          countryCode: code,
          countryName: payload.address?.country || code.toUpperCase()
        };
      }
    }
  }

  if (!destination || destination.trim().length < 2) return null;

  const searchResults = await fetchNominatim('/search', {
    q: destination.trim(),
    format: 'jsonv2',
    addressdetails: 1,
    limit: 5,
    dedupe: 1
  });

  const firstWithCountry = searchResults.find((item) => item.address?.country_code);
  if (!firstWithCountry || !firstWithCountry.address?.country_code) return null;

  return {
    countryCode: firstWithCountry.address.country_code.toLowerCase(),
    countryName: firstWithCountry.address.country || firstWithCountry.address.country_code.toUpperCase()
  };
};
