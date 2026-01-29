export type View = 'auth' | 'dashboard' | 'trip-detail' | 'lists' | 'profile';

export type POIType = 'hotel' | 'restaurant' | 'attraction' | 'transport' | 'coffee' | 'other';

export interface POI {
  id: number;
  name: string;
  type: POIType;
  location: string;
  time?: string;
  notes?: string;
  url?: string;
  imageUrl?: string;
  raw?: ApiPointOfInterest;
}

export interface DayItinerary {
  date: string;
  items: POI[];
}

export interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'future' | 'current' | 'past';
  coverImage: string;
  itinerary: DayItinerary[];
  raw?: ApiTrip;
}

export interface TravelList {
  id: number;
  title: string;
  type: 'packing' | 'wishlist' | 'custom';
  items: { id: number; content: string; completed: boolean; link?: string }[];
}

export interface ApiTrip {
  id: number;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pointsOfInterest?: ApiPointOfInterest[] | null;
  tripLists?: ApiTripList[] | null;
}

export interface ApiPointOfInterest {
  id: number;
  tripId: number;
  title: string;
  description?: string | null;
  url?: string | null;
  type?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tripDayIndex?: number | null;
}

export interface ApiTripList {
  id: number;
  title: string;
  tripId: number;
  listItems?: ApiTripListItem[] | null;
}

export interface ApiTripListItem {
  id: number;
  title: string;
  tripListId: number;
  isChecked: boolean;
}
