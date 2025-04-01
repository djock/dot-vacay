export interface PointOfInterest {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  type?: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
  latitude?: number;
  longitude?: number;
  tripDayIndex?: number;
}