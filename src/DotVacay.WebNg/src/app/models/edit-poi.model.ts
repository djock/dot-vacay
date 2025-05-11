export class EditPoiModel {
  id?: string;
  tripId: string = '';
  title: string = '';
  description: string = '';
  type: number = 3; // Default to Attraction
  url: string = '';
  startDate: string = '';
  endDate: string = '';
  latitude?: number;
  longitude?: number;
}

