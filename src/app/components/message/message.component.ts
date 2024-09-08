import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'error' = 'success';
  @Output() close = new EventEmitter<void>();

  private timer: any;

  ngOnInit() {
    if (this.message) {
      this.timer = setTimeout(() => {
        this.closeMessage();
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  closeMessage() {
    this.message = null;
    this.close.emit();
  }
}
