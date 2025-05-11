import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { PoiListItemComponent } from '../../components/poi-list-item/poi-list-item.component';
import { WeatherService, WeatherForecast } from '../../services/weather.service';

@Component({
  selector: 'trip-day',
  standalone: true,
  imports: [CommonModule, PoiListItemComponent],
  templateUrl: './trip-day.component.html',
  styleUrls: ['./trip-day.component.css']
})
export class TripDayComponent implements OnInit {
  @Input() currentDate: Date = new Date();
  @Input() pointsOfInterest: PointOfInterest[] = [];
  @Input() tripLocation: string = '';
  @Input() tripLatitude: number | null = null;
  @Input() tripLongitude: number | null = null;
  
  @Output() onAddPoi = new EventEmitter<Date>();
  @Output() onRefresh = new EventEmitter<Date>();
  @Output() onEditPoi = new EventEmitter<PointOfInterest>();
  @Output() onGenerateAiSuggestions = new EventEmitter<{date: Date, location: string}>();

  isGeneratingSuggestions: boolean = false;
  weatherForecast: WeatherForecast | null = null;
  isLoadingWeather: boolean = false;
  showWeather: boolean = false;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.checkAndLoadWeather();
  }

  checkAndLoadWeather(): void {
    // Check if date is within next 14 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    const tripDate = new Date(this.currentDate);
    tripDate.setHours(0, 0, 0, 0);
    
    this.showWeather = tripDate >= today && tripDate <= twoWeeksFromNow;
    
    // Load weather if date is within range and we have coordinates
    if (this.showWeather && this.tripLatitude && this.tripLongitude) {
      this.loadWeatherForecast();
    }
  }

  loadWeatherForecast(): void {
    this.isLoadingWeather = true;
    
    this.weatherService.getWeatherForecast(
      this.tripLatitude!, 
      this.tripLongitude!, 
      this.currentDate
    ).subscribe({
      next: (data) => {
        console.log('Weather data received:', data);

        this.weatherForecast = data;
        this.isLoadingWeather = false;
      },
      error: (error) => {
        console.error('Error loading weather forecast:', error);
        this.isLoadingWeather = false;
      }
    });
  }

  getWeatherIcon(): string {
    if (!this.weatherForecast?.daily?.weathercode?.[0]) {
      return 'bi-cloud';
    }
    return this.weatherService.getWeatherIcon(this.weatherForecast.daily.weathercode[0]);
  }

  openAddPoiModal(): void {
    this.onAddPoi.emit(this.currentDate);
  }

  refreshData(): void {
    this.onRefresh.emit(this.currentDate);
  }

  handleEditPoi(poi: PointOfInterest): void {
    this.onEditPoi.emit(poi);
  }

  generateAiSuggestions(): void {
    this.isGeneratingSuggestions = true;
    this.onGenerateAiSuggestions.emit({
      date: this.currentDate,
      location: this.tripLocation
    });
  }

  setGeneratingStatus(status: boolean): void {
    this.isGeneratingSuggestions = status;
  }
}


