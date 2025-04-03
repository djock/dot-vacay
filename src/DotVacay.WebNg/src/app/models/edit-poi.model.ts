import { PointOfInterestType } from "../enums/point-of-interest-type-enum";

export class EditPoiModel {
  id?: string;
  tripId?: string;
  title: string = '';
  description: string = '';
  startDate: string = '';
  endDate: string = '';
  location: string = '';
  latitude: number = 0;
  longitude: number = 0;
  type: PointOfInterestType = PointOfInterestType.Accomodation;
}
