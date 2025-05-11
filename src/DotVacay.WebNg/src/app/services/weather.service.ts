import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface WeatherForecast {
  success: boolean;
  error?: string;
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private apiService: ApiService) { }

  getWeatherForecast(latitude: number, longitude: number, date: Date): Observable<WeatherForecast> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('date', date.toISOString());

    return this.apiService.get<WeatherForecast>('/WeatherForecast/forecast', params);
  }

  // Helper method to get weather icon based on weather code
  getWeatherIcon(weatherCode: number): string {
    // Weather codes from Open-Meteo API
    if (weatherCode === 0) return 'bi-sun'; // Clear sky
    if (weatherCode >= 1 && weatherCode <= 3) return 'bi-cloud-sun'; // Partly cloudy
    if (weatherCode >= 45 && weatherCode <= 48) return 'bi-cloud-fog'; // Fog
    if (weatherCode >= 51 && weatherCode <= 55) return 'bi-cloud-drizzle'; // Drizzle
    if (weatherCode >= 56 && weatherCode <= 57) return 'bi-cloud-sleet'; // Freezing drizzle
    if (weatherCode >= 61 && weatherCode <= 65) return 'bi-cloud-rain'; // Rain
    if (weatherCode >= 66 && weatherCode <= 67) return 'bi-cloud-sleet'; // Freezing rain
    if (weatherCode >= 71 && weatherCode <= 77) return 'bi-cloud-snow'; // Snow
    if (weatherCode >= 80 && weatherCode <= 82) return 'bi-cloud-rain-heavy'; // Rain showers
    if (weatherCode >= 85 && weatherCode <= 86) return 'bi-cloud-snow'; // Snow showers
    if (weatherCode >= 95 && weatherCode <= 99) return 'bi-cloud-lightning-rain'; // Thunderstorm
    
    return 'bi-cloud'; // Default
  }
}
