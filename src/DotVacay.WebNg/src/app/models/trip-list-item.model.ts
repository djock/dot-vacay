export class TripListItemModel {
  id: string = '';
  title: string = '';
  description: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  isOwner: boolean = false;
}