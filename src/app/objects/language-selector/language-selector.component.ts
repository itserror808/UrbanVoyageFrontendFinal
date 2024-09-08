import { Component } from '@angular/core';
import { TranslationService } from "../../services/translation.service";

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  langs = [
    {code: 'EN', name: 'en'},
    {code: 'DE', name: 'de'},
    {code: 'FR', name: 'fr'},
    {code: 'ES', name: 'es'},
    {code: 'IT', name: 'it'},
    // Add more languages as needed
  ];

  constructor(private translationService: TranslationService) {}

  switchLang(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translationService.setLanguage(lang);
  }
}
