// src/app/services/auto-translate.directive.ts
import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appAutoTranslate]'
})
export class AutoTranslateDirective implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  private originalText: string = '';

  constructor(private el: ElementRef, private translationService: TranslationService) {}

  ngOnInit() {
    this.originalText = this.el.nativeElement.innerText.trim();
    this.subscription = this.translationService.getCurrentLang().subscribe(lang => {
      if (lang !== 'en') {
        this.translateElement(lang);
      } else {
        this.el.nativeElement.innerText = this.originalText;
      }
    });
  }

  translateElement(lang: string) {
    this.translationService.translate(this.originalText, lang).subscribe(
      (response: any) => {
        if (response && response.translatedText) {
          this.el.nativeElement.innerText = response.translatedText;
        }
      },
      (error) => {
        console.error('Translation error:', error);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
