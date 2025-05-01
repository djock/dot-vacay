import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AiSuggestionService } from './services/ai-suggestion.service';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppComponent
  ],
  providers: [
    AiSuggestionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

