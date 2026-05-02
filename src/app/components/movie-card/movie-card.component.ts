import { Component, input, output, inject, computed, signal } from '@angular/core';
import { Movie, Character } from '../../models/mcu.models';
import { ProgressService } from '../../services/progress.service';
import { UnsplashService } from '../../services/unsplash.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
  readonly characters = input<Character[]>([]);
  readonly onMovieClick = output<Movie>();
  readonly onToggleWatched = output<string>();
  readonly onCharacterClick = output<string>();

  private progress = inject(ProgressService);
  private unsplash = inject(UnsplashService);

  isWatched = computed(() => this.progress.isWatched(this.movie().id)());
  posterImageUrl = computed(() => this.unsplash.getMovieImage(this.movie().id));
  imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  openDetail(): void {
    this.onMovieClick.emit(this.movie());
  }

  toggleWatched(event: Event): void {
    event.stopPropagation();
    this.onToggleWatched.emit(this.movie().id);
  }

  clickCharacter(event: Event, id: string): void {
    event.stopPropagation();
    this.onCharacterClick.emit(id);
  }

  get visibleChars() {
    return this.characters().slice(0, 4);
  }

  get extraCharsCount() {
    const total = this.characters().length;
    return total > 4 ? total - 4 : 0;
  }

  get importanceClass() {
    return `importance-${this.movie().importance}`;
  }

  get importanceLabel() {
    return this.movie().importance.toUpperCase();
  }
}
