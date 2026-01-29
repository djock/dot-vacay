import { TripListItemModel } from './trip-list-item.model';

export class TripListModel {
  id: number = 0;
  title: string = '';
  tripId: number = 0;
  listItems: TripListItemModel[] = [];
}
