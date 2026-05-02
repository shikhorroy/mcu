import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  getMovieImage(movieId: string): string {
    return `assets/images/movies/${movieId}.jpg`;
  }

  getCharacterImage(charId: string): string {
    return `assets/images/characters/${charId}.jpg`;
  }
}
