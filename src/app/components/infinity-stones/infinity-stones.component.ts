import { Component, signal, OnDestroy, AfterViewInit, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Stone {
  name: string;
  alias: string;
  color: string;
  movie: string;
  phase: number;
  imagePath?: string;
}

const STONES: Stone[] = [
  { name: 'Space Stone', alias: 'Tesseract', color: '#4fc3f7', movie: 'Captain America: The First Avenger', phase: 1, imagePath: 'assets/images/stones/space-stone.jpg' },
  { name: 'Mind Stone', alias: 'Scepter / Vision', color: '#f9e04b', movie: 'The Avengers', phase: 1, imagePath: 'assets/images/stones/mind-stone.jpg' },
  { name: 'Reality Stone', alias: 'Aether', color: '#e23636', movie: 'Thor: The Dark World', phase: 2, imagePath: 'assets/images/stones/reality-stone.jpg' },
  { name: 'Power Stone', alias: 'The Orb', color: '#ab47bc', movie: 'Guardians of the Galaxy', phase: 2, imagePath: 'assets/images/stones/power-stone.jpg' },
  { name: 'Time Stone', alias: 'Eye of Agamotto', color: '#66bb6a', movie: 'Doctor Strange', phase: 3, imagePath: 'assets/images/stones/time-stone.jpg' },
  { name: 'Soul Stone', alias: 'Vormir Secret', color: '#ff7043', movie: 'Avengers: Infinity War', phase: 3, imagePath: 'assets/images/stones/soul-stone.jpg' },
];

@Component({
  selector: 'app-infinity-stones',
  standalone: true,
  templateUrl: './infinity-stones.component.html',
  styleUrl: './infinity-stones.component.scss'
})
export class InfinityStonesComponent implements AfterViewInit, OnDestroy {
  readonly stones = STONES;
  readonly triggered = signal(false);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      this.triggered.set(true);
      return;
    }

    const section = this.el.nativeElement.querySelector('.stones-section') as HTMLElement | null;
    const target = section ?? this.el.nativeElement;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          this.triggered.set(true);
          this.observer?.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: [0, 0.2]
      }
    );
    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
