import { Component, inject, signal, output, HostListener } from '@angular/core';
import { ScrollTrackerService } from '../../services/scroll-tracker.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  private scrollTracker = inject(ScrollTrackerService);
  readonly progress = inject(ProgressService);

  readonly openJourney = output<void>();
  readonly openSearch = output<void>();

  readonly scrolled = signal(false);

  readonly phases = [1, 2, 3, 4, 5];
  readonly phaseNames = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'];

  get activePhase() { return this.scrollTracker.activePhase(); }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 100);
  }

  scrollToPhase(phaseId: number): void {
    const el = document.getElementById(`phase-${phaseId}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
