import { Component } from '@angular/core';
import * as L from 'leaflet';


@Component({
  selector: 'app-our-location-map',
  templateUrl: './our-location-map.component.html',
  styleUrls: ['./our-location-map.component.css']
})
export class OurLocationMapComponent {
  private map?: L.Map;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([51.505, -0.09]).addTo(this.map)
      .bindPopup('Urban Voyage Headquarters')
      .openPopup();
  }
}
