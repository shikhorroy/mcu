import { Component, input, output, inject, computed, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Character } from '../../models/mcu.models';
import { DataService } from '../../services/data.service';
import { ProgressService } from '../../services/progress.service';
import { UnsplashService } from '../../services/unsplash.service';

@Component({
  selector: 'app-character-detail-panel',
  standalone: true,
  templateUrl: './character-detail-panel.component.html',
  styleUrl: './character-detail-panel.component.scss'
})
export class CharacterDetailPanelComponent implements OnInit, OnDestroy {
  readonly character = input<Character | null>(null);
  readonly onClose = output<void>();
  readonly onMovieClick = output<string>();

  private dataService = inject(DataService);
  private progress = inject(ProgressService);
  private unsplash = inject(UnsplashService);

  portraitLoaded = signal(false);

  portraitUrl = computed(() => {
    const c = this.character();
    return c ? this.unsplash.getCharacterImage(c.id) : null;
  });

  onPortraitLoad(): void { this.portraitLoaded.set(true); }
  onPortraitError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  movies = computed(() => {
    const c = this.character();
    if (!c) return [];
    return this.dataService.allMovies().filter(m => c.movieIds.includes(m.id));
  });

  watchedCount = computed(() => {
    const c = this.character();
    if (!c) return 0;
    return this.progress.watchedCountForCharacter(c.movieIds)();
  });

  arcPct = computed(() => {
    const total = this.movies().length;
    return total ? Math.round((this.watchedCount() / total) * 100) : 0;
  });

  getConnectedChar(id: string) {
    return this.dataService.characters().find(c => c.id === id);
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  isMovieWatched(movieId: string): boolean {
    return this.progress.isWatched(movieId)();
  }

  isDebut(movieId: string): boolean {
    const c = this.character();
    if (!c) return false;
    const movie = this.dataService.allMovies().find(m => m.id === movieId);
    return movie?.charactersIntroduced.includes(c.id) ?? false;
  }

  getPhaseForMovie(movieId: string): number {
    return this.dataService.phases().find(p => p.movies.some(m => m.id === movieId))?.id ?? 1;
  }

  arcCircumference = 2 * Math.PI * 36;

  get arcDashOffset(): number {
    return this.arcCircumference * (1 - this.arcPct() / 100);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose.emit();
  }

  ngOnInit(): void {
    const c = this.character();
    if (c) this.progress.markCharacterExplored(c.id);
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
