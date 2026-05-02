import { Component, output, inject, signal, computed, HostListener, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Movie, Character } from '../../models/mcu.models';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss'
})
export class SearchOverlayComponent {
  @ViewChild('searchInput') inputRef?: ElementRef<HTMLInputElement>;

  readonly onClose = output<void>();
  readonly onMovieSelected = output<Movie>();
  readonly onCharacterSelected = output<string>();

  private dataService = inject(DataService);

  query = signal('');

  movieResults = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.dataService.allMovies()
      .filter(m => m.title.toLowerCase().includes(q) || String(m.year).includes(q))
      .slice(0, 8);
  });

  charResults = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.dataService.characters()
      .filter(c => c.name.toLowerCase().includes(q) || (c.alias?.toLowerCase().includes(q)))
      .slice(0, 6);
  });

  constructor() {
    afterNextRender(() => {
      this.inputRef?.nativeElement.focus();
    });
  }

  setQuery(val: string): void {
    this.query.set(val);
  }

  selectMovie(movie: Movie): void {
    this.onMovieSelected.emit(movie);
    this.onClose.emit();
  }

  selectChar(char: Character): void {
    this.onCharacterSelected.emit(char.id);
    this.onClose.emit();
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.onClose.emit(); }
}
