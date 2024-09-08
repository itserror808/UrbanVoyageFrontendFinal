// src/app/services/shared-data.service.ts

import { Injectable } from '@angular/core';
import { Schedule } from '../models/schedule.model';
import {User} from "../models/user.model";
import {Reservation} from "../models/reservation.model";
import {Passenger} from "../models/passenger.model";

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private selectedSchedule: Schedule | null = null;
  private selectedReservation: Reservation | null = null;
  private selectedPassenger: Passenger | null = null;

  setSelectedSchedule(schedule: Schedule) {
    this.selectedSchedule = schedule;
  }

  getSelectedSchedule(): Schedule | null {
    return this.selectedSchedule;
  }

  clearSelectedSchedule() {
    this.selectedSchedule = null;
  }

  setSelectedReservation(reservation: Reservation) {
    this.selectedReservation = reservation;
  }

  getSelectedReservation(): Reservation | null {
    return this.selectedReservation;
  }

  clearSelectedReservation() {
    this.selectedReservation = null;
  }


  setSelectedPassenger(passenger: Passenger) {
    this.selectedPassenger = passenger;
  }

  getSelectedPassenger(): Passenger | null {
    return this.selectedPassenger;
  }

  clearSelectedPassenger() {
    this.selectedPassenger = null;
  }

}
