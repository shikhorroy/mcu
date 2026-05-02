import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollTrackerService {
  readonly activePhase = signal<number>(1);

  observePhase(element: Element, phaseId: number): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activePhase.set(phaseId);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(element);
  }
}
