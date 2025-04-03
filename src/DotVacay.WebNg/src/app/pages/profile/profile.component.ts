import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user-profile.model';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';
  profile: UserProfile = {
    firstName: '',
    lastName: '',
    email: ''
  };
  
  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (result) => {
        if (result.success && result.userProfile) {
          this.profile = result.userProfile;
        } else {
          if (result.errors?.length) {
            this.errorMessage = result.errors[0];
          } else {
            this.errorMessage = 'Profile data not found in response';
          }
        }
      },
      error: (error) => {
        console.error('Failed to get user profile', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to get user profile';
      }
    });
  }

  getGravatarUrl(email: string): string {
    if (!email) {
      return 'https://gravatar.com/avatar/?d=robohash&s=400&r=x';
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    const emailHash = CryptoJS.MD5(normalizedEmail).toString();
    
    // Return the Gravatar URL with robohash as default image
    return `https://gravatar.com/avatar/${emailHash}?s=400&d=robohash&r=x`;
  }
}
