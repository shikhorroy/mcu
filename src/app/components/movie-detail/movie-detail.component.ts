import { Component, input, output, inject, computed, signal, OnInit, OnDestroy, HostListener, effect } from '@angular/core';
import { Movie } from '../../models/mcu.models';
import { DataService } from '../../services/data.service';
import { ProgressService } from '../../services/progress.service';
import { UnsplashService } from '../../services/unsplash.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  readonly movie = input<Movie | null>(null);
  readonly onClose = output<void>();
  readonly onCharacterClick = output<string>();
  readonly onNavigate = output<Movie>();

  private dataService = inject(DataService);
  private progress = inject(ProgressService);
  private unsplash = inject(UnsplashService);

  confirmRemove = false;
  heroImageUrl = signal<string | null>(null);
  heroImageLoaded = signal(false);
  stoneImageFailed = signal(false);

  characters = computed(() => {
    const m = this.movie();
    if (!m) return [];
    return this.dataService.characters().filter(c => m.charactersAppearing.includes(c.id));
  });

  isWatched = computed(() => {
    const m = this.movie();
    return m ? this.progress.isWatched(m.id)() : false;
  });

  phaseNumber = computed(() => this.movie()?.phase ?? 1);

  phaseMovies = computed(() => {
    const m = this.movie();
    if (!m) return [] as Movie[];
    const phase = this.dataService.phases().find(p => p.id === m.phase);
    return phase?.movies ?? [];
  });

  currentMovieIndex = computed(() => {
    const m = this.movie();
    if (!m) return -1;
    return this.phaseMovies().findIndex(pm => pm.id === m.id);
  });

  prevMovie = computed(() => {
    const idx = this.currentMovieIndex();
    if (idx <= 0) return null;
    return this.phaseMovies()[idx - 1] ?? null;
  });

  nextMovie = computed(() => {
    const idx = this.currentMovieIndex();
    if (idx < 0 || idx >= this.phaseMovies().length - 1) return null;
    return this.phaseMovies()[idx + 1] ?? null;
  });

  private resolveStoneImagePath(stoneName: string): string | null {
    const normalized = stoneName.toLowerCase();

    if (normalized.includes('space stone')) return 'assets/images/stones/space-stone.jpg';
    if (normalized.includes('mind stone')) return 'assets/images/stones/mind-stone.jpg';
    if (normalized.includes('reality stone')) return 'assets/images/stones/reality-stone.jpg';
    if (normalized.includes('power stone')) return 'assets/images/stones/power-stone.jpg';
    if (normalized.includes('time stone')) return 'assets/images/stones/time-stone.jpg';
    if (normalized.includes('soul stone')) return 'assets/images/stones/soul-stone.jpg';

    return null;
  }

  stoneImageUrl = computed(() => {
    const stoneName = this.movie()?.infinityStone?.name;
    if (!stoneName) return null;
    return this.resolveStoneImagePath(stoneName);
  });

  constructor() {
    effect(() => {
      const m = this.movie();
      this.heroImageUrl.set(m ? this.unsplash.getMovieImage(m.id) : null);
      this.heroImageLoaded.set(false);
      this.stoneImageFailed.set(false);
    });
  }

  onHeroLoad(): void { this.heroImageLoaded.set(true); }
  onHeroError(): void { this.heroImageUrl.set(null); }
  onStoneImageError(): void { this.stoneImageFailed.set(true); }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  isIntroduced(charId: string): boolean {
    return this.movie()?.charactersIntroduced.includes(charId) ?? false;
  }

  goPrevMovie(): void {
    const prev = this.prevMovie();
    if (!prev) return;
    this.onNavigate.emit(prev);
  }

  goNextMovie(): void {
    const next = this.nextMovie();
    if (!next) return;
    this.onNavigate.emit(next);
  }

  toggleWatched(): void {
    const m = this.movie();
    if (!m) return;
    if (this.isWatched() && !this.confirmRemove) {
      this.confirmRemove = true;
      return;
    }
    this.confirmRemove = false;
    this.progress.toggleWatched(m.id);
  }

  cancelRemove(): void {
    this.confirmRemove = false;
  }

  sigClass(sig: string): string {
    return `sig-${sig}`;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose.emit();
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
