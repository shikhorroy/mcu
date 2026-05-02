import { Component, input, output, inject, OnInit, ElementRef, OnDestroy, computed } from '@angular/core';
import { Phase, Movie, Character } from '../../models/mcu.models';
import { DataService } from '../../services/data.service';
import { ProgressService } from '../../services/progress.service';
import { ScrollTrackerService } from '../../services/scroll-tracker.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-phase-section',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './phase-section.component.html',
  styleUrl: './phase-section.component.scss'
})
export class PhaseSectionComponent implements OnInit, OnDestroy {
  readonly phase = input.required<Phase>();
  readonly onMovieClick = output<Movie>();
  readonly onCharacterClick = output<string>();

  private dataService = inject(DataService);
  private progress = inject(ProgressService);
  private scrollTracker = inject(ScrollTrackerService);
  private el = inject(ElementRef);

  watchedCount = computed(() =>
    this.progress.watchedCountForPhase(this.phase().movies.map(m => m.id))()
  );

  get progressPct() {
    const total = this.phase().movies.length;
    return total ? (this.watchedCount() / total) * 100 : 0;
  }

  get isComplete() {
    return this.watchedCount() === this.phase().movies.length;
  }

  getCharsForMovie(movie: Movie): Character[] {
    return this.dataService.characters().filter(c => movie.charactersAppearing.includes(c.id));
  }

  toggleWatched(movieId: string): void {
    this.progress.toggleWatched(movieId);
  }

  ngOnInit(): void {
    this.scrollTracker.observePhase(this.el.nativeElement, this.phase().id);
    if (typeof window !== 'undefined') {
      this.initGsap();
    }
  }

  private async initGsap(): Promise<void> {
    try {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const header = this.el.nativeElement.querySelector('.phase-header');
      const cards = this.el.nativeElement.querySelectorAll('app-movie-card');
      const bgNum = this.el.nativeElement.querySelector('.phase-bg-number');

      if (header) {
        gsap.fromTo(header, { x: -60, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: header, start: 'top 85%', once: true }
        });
      }

      if (bgNum) {
        gsap.fromTo(bgNum, { opacity: 0 }, {
          opacity: 1, duration: 1.2, ease: 'power1.out',
          scrollTrigger: { trigger: bgNum, start: 'top 90%', once: true }
        });
      }

      cards.forEach((card: Element, i: number) => {
        gsap.fromTo(card, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.5, ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 90%', once: true }
        });
      });
    } catch {}
  }

  ngOnDestroy(): void {}
}
