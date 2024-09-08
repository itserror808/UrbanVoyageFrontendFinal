import { Component } from '@angular/core';

@Component({
  selector: 'app-dark-mode-toggle',
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.css']
})
export class DarkModeToggleComponent {
  darkMode: boolean = false;

  ngOnInit(): void {
    this.loadTheme();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.updateTheme();
  }

  private loadTheme(): void {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.updateTheme();
  }

  private updateTheme(): void {
    const htmlElement = document.documentElement;
    if (this.darkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }
}
