import { Injectable, signal, computed, effect } from '@angular/core';

export interface UserProgress {
  watchedMovies: string[];
  exploredCharacters: string[];
  lastUpdated: number;
  schemaVersion: number;
}

const STORAGE_KEY = 'mcu-progress';
const SCHEMA_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private _progress = signal<UserProgress>(this.load());

  readonly watchedMovies = computed(() => this._progress().watchedMovies);
  readonly exploredCharacters = computed(() => this._progress().exploredCharacters);
  readonly watchedCount = computed(() => this._progress().watchedMovies.length);
  readonly exploredCount = computed(() => this._progress().exploredCharacters.length);

  constructor() {
    effect(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this._progress()));
        }
      } catch {}
    });
  }

  isWatched(movieId: string) {
    return computed(() => this._progress().watchedMovies.includes(movieId));
  }

  hasExplored(characterId: string) {
    return computed(() => this._progress().exploredCharacters.includes(characterId));
  }

  watchedCountForPhase(phaseMovieIds: string[]) {
    return computed(() => phaseMovieIds.filter(id => this._progress().watchedMovies.includes(id)).length);
  }

  watchedCountForCharacter(movieIds: string[]) {
    return computed(() => movieIds.filter(id => this._progress().watchedMovies.includes(id)).length);
  }

  toggleWatched(movieId: string): void {
    this._progress.update(p => {
      const movies = p.watchedMovies.includes(movieId)
        ? p.watchedMovies.filter(id => id !== movieId)
        : [...p.watchedMovies, movieId];
      return { ...p, watchedMovies: movies, lastUpdated: Date.now() };
    });
  }

  markCharacterExplored(characterId: string): void {
    this._progress.update(p => ({
      ...p,
      exploredCharacters: p.exploredCharacters.includes(characterId)
        ? p.exploredCharacters
        : [...p.exploredCharacters, characterId],
      lastUpdated: Date.now()
    }));
  }

  resetProgress(): void {
    this._progress.set({ watchedMovies: [], exploredCharacters: [], lastUpdated: Date.now(), schemaVersion: SCHEMA_VERSION });
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  private load(): UserProgress {
    try {
      if (typeof localStorage === 'undefined') return this.defaultProgress();
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.defaultProgress();
      const parsed = JSON.parse(raw) as UserProgress;
      if (parsed.schemaVersion !== SCHEMA_VERSION) return this.defaultProgress();
      return parsed;
    } catch {
      return this.defaultProgress();
    }
  }

  private defaultProgress(): UserProgress {
    return { watchedMovies: [], exploredCharacters: [], lastUpdated: Date.now(), schemaVersion: SCHEMA_VERSION };
  }
}
