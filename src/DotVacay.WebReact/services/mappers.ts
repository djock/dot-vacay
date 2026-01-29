import { ApiPointOfInterest, ApiTrip, DayItinerary, POI, POIType, Trip } from '../types';

const poiTypeToUi = (type?: number | null): POIType => {
  switch (type) {
    case 0:
      return 'hotel';
    case 1:
      return 'transport';
    case 2:
      return 'restaurant';
    case 3:
      return 'coffee';
    case 4:
    case 5:
      return 'attraction';
    default:
      return 'other';
  }
};

export const uiTypeToApi = (type: POIType): number => {
  switch (type) {
    case 'hotel':
      return 0;
    case 'transport':
      return 1;
    case 'restaurant':
      return 2;
    case 'coffee':
      return 3;
    case 'attraction':
      return 4;
    default:
      return 6;
  }
};

export const parsePoiDescription = (description?: string | null) => {
  if (!description) {
    return { location: '', notes: '' };
  }

  const locationMatch = description.match(/Location:\s*(.*?)(?:\n|$)/i);
  const notesMatch = description.match(/Notes:\s*([\s\S]*)$/i);

  if (locationMatch || notesMatch) {
    return {
      location: (locationMatch?.[1] || '').trim(),
      notes: (notesMatch?.[1] || '').trim()
    };
  }

  return { location: '', notes: description.trim() };
};

export const buildPoiDescription = (location: string, notes: string) => {
  const parts: string[] = [];
  if (location) {
    parts.push(`Location: ${location}`);
  }
  if (notes) {
    parts.push(`Notes: ${notes}`);
  }
  return parts.join('\n');
};

const formatTime = (value?: string | null) => {
  if (!value) return '';
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (date: Date, other: Date) =>
  date.getFullYear() === other.getFullYear() &&
  date.getMonth() === other.getMonth() &&
  date.getDate() === other.getDate();

const includesDay = (day: Date, start?: string | null, end?: string | null) => {
  if (!start || !end) return false;
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const poiStart = new Date(start);
  const poiEnd = new Date(end);

  return (
    (poiStart >= dayStart && poiStart <= dayEnd) ||
    (poiEnd >= dayStart && poiEnd <= dayEnd) ||
    (poiStart <= dayStart && poiEnd >= dayEnd)
  );
};

export const mapApiPoiToUi = (poi: ApiPointOfInterest, fallbackLocation: string): POI => {
  const { location, notes } = parsePoiDescription(poi.description);

  return {
    id: poi.id,
    name: poi.title,
    type: poiTypeToUi(poi.type),
    location: location || fallbackLocation,
    time: formatTime(poi.startDate),
    notes: notes,
    url: poi.url || undefined,
    raw: poi
  };
};

export const buildItinerary = (trip: ApiTrip): DayItinerary[] => {
  if (!trip.startDate || !trip.endDate) {
    return [];
  }

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  const days: DayItinerary[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dayIso = current.toISOString();
    const items = (trip.pointsOfInterest || [])
      .filter((poi) => includesDay(current, poi.startDate || undefined, poi.endDate || undefined))
      .map((poi) => mapApiPoiToUi(poi, trip.title));

    days.push({
      date: dayIso,
      items
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
};

export const computeTripStatus = (trip: ApiTrip): 'future' | 'current' | 'past' => {
  if (!trip.startDate || !trip.endDate) {
    return 'future';
  }

  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (end < now && !isSameDay(end, now)) {
    return 'past';
  }

  if (start > now && !isSameDay(start, now)) {
    return 'future';
  }

  return 'current';
};

export const mapApiTripToUi = (trip: ApiTrip): Trip => {
  return {
    id: trip.id,
    destination: trip.title,
    startDate: trip.startDate || new Date().toISOString(),
    endDate: trip.endDate || new Date().toISOString(),
    status: computeTripStatus(trip),
    coverImage: `https://picsum.photos/seed/trip-${trip.id}/800/400`,
    itinerary: buildItinerary(trip),
    raw: trip
  };
};
