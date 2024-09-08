import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  stripe: any;
  card: any;

  @Output() closePayment = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51PeM4VE38gz1e3HyUYQ85O3HMzbb8Om6jmsatVwPXPPwIITuzGx8Hy6WuSniTGM3RXT6PikF1g5Q0l29HEt7BNdc00zmZoc0IF');
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  }
  async handlePayment() {
    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });

    if (error) {
      console.error(error);
    } else {
      this.http.post('/api/payment/create-payment-intent', { amount: 1000, currency: 'usd' })
        .subscribe(
          async (response: any) => {
            const { clientSecret } = response;
            const result = await this.stripe.confirmCardPayment(clientSecret, {
              payment_method: paymentMethod.id
            });

            if (result.error) {
              console.error(result.error);
            } else {
              console.log('Payment successful');
            }
          },
          error => {
            console.error('Error creating payment intent', error);
          }
        );
    }
    this.closePayment.emit();
  }
}
