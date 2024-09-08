import { Component, OnInit } from '@angular/core';
import { Sponsor } from "../../models/sponsor.model";
import { SponsorService } from "../../services/sponsor.service";

@Component({
  selector: 'app-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.css']
})
export class SponsorsComponent implements OnInit {
  sponsors: Sponsor[] = [];

  constructor(private sponsorService: SponsorService) {}

  ngOnInit() {
    this.loadSponsors();
  }

  loadSponsors() {
    this.sponsorService.getSponsors().subscribe({
      next: (data) => {
        this.sponsors = this.duplicateSponsorsIfFew(data);
      },
      error: (error) => {
        console.error('Error fetching sponsors:', error);
      }
    });
  }

  duplicateSponsorsIfFew(originalSponsors: Sponsor[]): Sponsor[] {
    const minDesiredSponsors = 10; // You can adjust this number as needed
    let duplicatedSponsors = [...originalSponsors];

    while (duplicatedSponsors.length < minDesiredSponsors) {
      duplicatedSponsors = [...duplicatedSponsors, ...originalSponsors];
    }

    return duplicatedSponsors;
  }
}
