import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import { locations } from '../../data/locations.data';
import 'leaflet-routing-machine';


// Update the declaration to extend existing types

declare module 'leaflet' {
  namespace Routing {
    type CustomRoutingControlOptions = L.Routing.RoutingControlOptions & {
      waypoints: L.LatLng[];
      lineOptions?: Partial<L.Routing.LineOptions>;
    };

    function control(options?: CustomRoutingControlOptions): Control;

    interface Control extends L.Control {
      addTo(map: L.Map): this;
      on(event: string, fn: (e: any) => void): this;
    }
  }
}


@Component({
  selector: 'app-morocco-map',
  templateUrl: './morocco-map.component.html',
  styleUrls: ['./morocco-map.component.css']
})
export class MoroccoMapComponent implements OnInit, AfterViewInit {
  @Output() citiesSelected = new EventEmitter<{ departure: string, arrival: string, distance: number }>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() searchRoutes = new EventEmitter<void>();

  private routingControl: L.Routing.Control | null = null;

  private map!: L.Map;
  departureCity: string | null = null;
  arrivalCity: string | null = null;
  distance: number = 0;
  private cityMarkers: { [key: string]: L.Marker } = {};
  private routeLine: L.Polyline | null = null;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [28.748110, -8.730076],
      zoom: 5.8,
      minZoom: 5,
      maxZoom: 8,
      zoomControl: false,
      zoomSnap: 0.1,
      zoomDelta: 0.5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    }).addTo(this.map);

    this.addCustomControls();
    this.addCityMarkers();
  }

  private addCustomControls(): void {
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    const customControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = `
          <button class="bg-teal-600 hover:bg-teal-700 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white dark:text-darkText shadow transition-colors  disabled:opacity-50 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            Reset View
          </button>
        `;
        container.onclick = () => {
          this.map.setView([28.748110, -8.730076], 5.8);
        };
        return container;
      }
    });

    this.map.addControl(new customControl());
  }

  private addCityMarkers(): void {
    locations.forEach(location => {
      const cityIcon = L.divIcon({
        className: 'city-marker',
        html: `
          <style>
            .marker {
              transition: all 0.3s ease;
            }

            .marker:hover {
              transform: scale(1.1);
            }

            .marker-inner {
              fill: #14b8a6;
              transition: all 0.3s ease;
            }

            .marker .marker-inner:hover {
              fill: #0d9488;
            }
          </style>

          <svg class="marker" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path class="marker-inner" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      const marker = L.marker([location.lat, location.lng], { icon: cityIcon })
        .addTo(this.map)
        .on('click', () => this.onMarkerClick(location.name));

      this.cityMarkers[location.name] = marker;

      const element = marker.getElement();
      if (element) {
        element.classList.add('transition-all', 'duration-100', 'ease-in-out');
        element.addEventListener('mouseover', () => this.onMarkerHover(location.name, true));
        element.addEventListener('mouseout', () => this.onMarkerHover(location.name, false));
      }
    });
  }

  private onMarkerClick(cityName: string): void {
    if (!this.departureCity) {
      this.departureCity = cityName;
      this.setActiveMarker(cityName);
    } else if (!this.arrivalCity && cityName !== this.departureCity) {
      this.arrivalCity = cityName;
      this.setActiveMarker(cityName);
      this.drawRoute();
    } else {
      this.clearRoute();
      this.clearActiveMarkers();
      this.departureCity = cityName;
      this.arrivalCity = null;
      this.setActiveMarker(cityName);
    }
    this.updateFooter();
  }

  private onMarkerHover(cityName: string, isHovering: boolean): void {
    const element = this.cityMarkers[cityName].getElement();
    if (element) {
      if (isHovering) {
        element.classList.add('hover:scale-110', 'hover:text-teal-500');
      } else {
        element.classList.remove('hover:scale-110', 'hover:text-teal-500');
      }
    }
  }

  private setActiveMarker(cityName: string): void {
    const element = this.cityMarkers[cityName].getElement();
    if (element) {
      element.classList.add('active', 'text-teal-500');
    }
  }

  private clearActiveMarkers(): void {
    Object.values(this.cityMarkers).forEach(marker => {
      const element = marker.getElement();
      if (element) {
        element.classList.remove('active', 'text-teal-500');
      }
    });
  }

  private drawRoute(): void {
    if (this.departureCity && this.arrivalCity) {
      const departure = locations.find(loc => loc.name === this.departureCity);
      const arrival = locations.find(loc => loc.name === this.arrivalCity);

      if (departure && arrival) {
        if (this.routingControl) {
          this.map.removeControl(this.routingControl);
        }

        const routingControlOptions: L.Routing.CustomRoutingControlOptions = {
          waypoints: [
            L.latLng(departure.lat, departure.lng),
            L.latLng(arrival.lat, arrival.lng)
          ],
          routeWhileDragging: true,
          showAlternatives: false,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [{ color: '#14b8a6', weight: 4 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          }
        };

        this.routingControl = L.Routing.control(routingControlOptions).addTo(this.map);

        this.routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          this.distance = Math.round(summary.totalDistance / 1000); // Convert to km
          this.updateFooter();
        });
      }
    }
  }

  private clearRoute(): void {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    this.distance = 0;
  }

  private calculateDistance(point1: any, point2: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private updateFooter(): void {
    if (this.departureCity && this.arrivalCity) {
      this.citiesSelected.emit({
        departure: this.departureCity,
        arrival: this.arrivalCity,
        distance: this.distance
      });
    }
  }

  confirmSelection(): void {
    if (this.departureCity && this.arrivalCity) {
      this.citiesSelected.emit({
        departure: this.departureCity,
        arrival: this.arrivalCity,
        distance: this.distance
      });
    }
    this.searchRoutes.emit();
  }

  closeMapModal(): void {
    this.closeModal.emit();
  }



  departureSearch: string = '';
  arrivalSearch: string = '';
  filteredDepartureCities: any[] = [];
  filteredArrivalCities: any[] = [];

  // ... existing methods ...

  filterCities(type: 'departure' | 'arrival') {
    const searchTerm = type === 'departure' ? this.departureSearch.toLowerCase() : this.arrivalSearch.toLowerCase();
    const filteredCities = locations.filter(city =>
      city.name.toLowerCase().includes(searchTerm)
    );

    if (type === 'departure') {
      this.filteredDepartureCities = filteredCities;
    } else {
      this.filteredArrivalCities = filteredCities;
    }
  }

  selectCity(type: 'departure' | 'arrival', city: any) {
    if (type === 'departure') {
      this.departureCity = city.name;
      this.departureSearch = city.name;
      this.filteredDepartureCities = [];
    } else {
      this.arrivalCity = city.name;
      this.arrivalSearch = city.name;
      this.filteredArrivalCities = [];
    }

    this.setActiveMarker(city.name);
    this.map.setView([city.lat, city.lng], 7);

    if (this.departureCity && this.arrivalCity) {
      this.drawRoute();
    }
  }
}
