import { Component, signal, OnInit, OnDestroy, ElementRef, inject, afterNextRender } from '@angular/core';

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
export class InfinityStonesComponent implements OnInit, OnDestroy {
  readonly stones = STONES;
  readonly triggered = signal(false);
  private el = inject(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      this.setupObserver();
    });
  }

  ngOnInit(): void {}

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) {
          this.triggered.set(true);
        } else if (entry.intersectionRatio < 0.1) {
          this.triggered.set(false);
        }
      },
      { threshold: [0.1, 0.5] }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
