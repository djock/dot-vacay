import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { TripService } from './services/trip.service';
import { AiSuggestionService } from './services/ai-suggestion.service';
import { PointOfInterestService } from './services/point-of-interest.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    ApiService,
    TripService,
    AiSuggestionService,
    PointOfInterestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


