import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private baseFare = 10; // Base fare in your currency
  private ratePerKm = 0.5; // Rate per kilometer
  private fuelCostPerLiter = 1.2; // Current fuel cost per liter
  private avgFuelConsumption = 0.1; // Liters per km

  calculateTicketPrice(distance: number, additionalFactors: any = {}): number {
    let price = this.baseFare + (distance * this.ratePerKm);

    // Calculate fuel cost
    const fuelCost = distance * this.avgFuelConsumption * this.fuelCostPerLiter;
    price += fuelCost;


    // Add more factors as needed

    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  // You can add methods to update rates, fuel costs, etc.
}
