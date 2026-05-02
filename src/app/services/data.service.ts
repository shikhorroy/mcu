import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Phase, Character, PhaseComingSoon } from '../models/mcu.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  readonly phases = toSignal(
    this.http.get<Phase[]>('assets/data/phases.json'),
    { initialValue: [] as Phase[] }
  );

  readonly characters = toSignal(
    this.http.get<Character[]>('assets/data/characters.json'),
    { initialValue: [] as Character[] }
  );

  readonly comingSoon = toSignal(
    this.http.get<PhaseComingSoon>('assets/data/coming-soon.json'),
    { initialValue: null }
  );

  readonly allMovies = computed(() => this.phases().flatMap(p => p.movies));
  readonly totalMovieCount = computed(() => this.allMovies().length);

  getPhaseById(id: number) {
    return computed(() => this.phases().find(p => p.id === id));
  }

  getMovieById(id: string) {
    return computed(() => this.allMovies().find(m => m.id === id));
  }

  getCharacterById(id: string) {
    return computed(() => this.characters().find(c => c.id === id));
  }

  getCharactersForMovie(movieId: string) {
    return computed(() => {
      const movie = this.allMovies().find(m => m.id === movieId);
      if (!movie) return [];
      return this.characters().filter(c => movie.charactersAppearing.includes(c.id));
    });
  }

  getMoviesForCharacter(characterId: string) {
    return computed(() => {
      const character = this.characters().find(c => c.id === characterId);
      if (!character) return [];
      return this.allMovies().filter(m => character.movieIds.includes(m.id));
    });
  }

  getPhaseForMovie(movieId: string) {
    return computed(() => this.phases().find(p => p.movies.some(m => m.id === movieId)));
  }
}
