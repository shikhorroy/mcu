import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { DataService } from './services/data.service';
import { ProgressService } from './services/progress.service';
import { Movie } from './models/mcu.models';

import { StarfieldComponent } from './components/starfield/starfield.component';
import { NavComponent } from './components/nav/nav.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { PhaseSectionComponent } from './components/phase-section/phase-section.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { CharacterDetailPanelComponent } from './components/character-detail-panel/character-detail-panel.component';
import { CharacterGraphComponent } from './components/character-graph/character-graph.component';
import { InfinityStonesComponent } from './components/infinity-stones/infinity-stones.component';
import { StoryTransitionComponent } from './components/story-transition/story-transition.component';
import { PhaseComingSoonComponent } from './components/phase-coming-soon/phase-coming-soon.component';
import { MyJourneyPanelComponent } from './components/my-journey-panel/my-journey-panel.component';
import { SearchOverlayComponent } from './components/search-overlay/search-overlay.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    StarfieldComponent,
    NavComponent,
    HeroSectionComponent,
    PhaseSectionComponent,
    MovieDetailComponent,
    CharacterDetailPanelComponent,
    CharacterGraphComponent,
    InfinityStonesComponent,
    StoryTransitionComponent,
    PhaseComingSoonComponent,
    MyJourneyPanelComponent,
    SearchOverlayComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly dataService = inject(DataService);
  readonly progress = inject(ProgressService);

  readonly selectedMovie = signal<Movie | null>(null);
  readonly selectedCharId = signal<string | null>(null);
  readonly showJourney = signal(false);
  readonly showSearch = signal(false);
  readonly scrollProgress = signal(0);
  private panelSwapTimer: ReturnType<typeof setTimeout> | null = null;

  readonly phases = computed(() => this.dataService.phases());
  readonly allChars = computed(() => this.dataService.characters());

  selectedChar = computed(() =>
    this.selectedCharId() ? this.dataService.characters().find(c => c.id === this.selectedCharId()) ?? null : null
  );

  readonly phaseNumbers = [1, 2, 3, 4, 5];

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      this.scrollProgress.set(window.scrollY / scrollHeight);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.showSearch.set(true);
    }
  }

  openMovie(movie: Movie): void {
    if (this.panelSwapTimer) {
      clearTimeout(this.panelSwapTimer);
      this.panelSwapTimer = null;
    }

    // If character panel is open, swap panels instead of stacking.
    if (this.selectedChar()) {
      this.selectedCharId.set(null);
      this.panelSwapTimer = setTimeout(() => {
        this.selectedMovie.set(movie);
      }, 120);
      return;
    }

    this.selectedMovie.set(movie);
  }

  openCharacter(id: string): void {
    if (this.panelSwapTimer) {
      clearTimeout(this.panelSwapTimer);
      this.panelSwapTimer = null;
    }

    // If movie panel is open, swap panels instead of stacking.
    if (this.selectedMovie()) {
      this.selectedMovie.set(null);
      this.panelSwapTimer = setTimeout(() => {
        this.selectedCharId.set(id);
      }, 120);
      return;
    }

    this.selectedCharId.set(id);
  }

  closeMovie(): void {
    this.selectedMovie.set(null);
  }

  closeChar(): void {
    this.selectedCharId.set(null);
  }

  onMovieSelectedFromSearch(movie: Movie): void {
    const el = document.getElementById(`phase-${movie.phase}`);
    el?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => this.openMovie(movie), 400);
  }

  scrollToPhase(id: number): void {
    document.getElementById(`phase-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  }

  get progressGradient(): string {
    const pct = this.scrollProgress() * 100;
    return `linear-gradient(to right, var(--phase-1), var(--phase-2), var(--phase-3), var(--phase-4), var(--phase-5) ${pct}%)`;
  }
}
