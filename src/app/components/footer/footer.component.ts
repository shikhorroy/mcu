import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p class="footer-text">MCU - A fan visualization project. All Marvel characters and films are property of Marvel Studios / Disney.</p>
    </footer>
  `,
  styles: [`
    .footer {
      padding: 2rem;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.04);
      background: var(--color-bg-primary);
    }
    .footer-text {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      line-height: 1.6;
    }
    @media (max-width: 767px) {
      .footer { font-size: 0.65rem; padding-bottom: 80px; }
    }
  `]
})
export class FooterComponent {}
