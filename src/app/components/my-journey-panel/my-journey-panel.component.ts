import { Component, output, inject, computed, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ProgressService } from '../../services/progress.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-my-journey-panel',
  standalone: true,
  templateUrl: './my-journey-panel.component.html',
  styleUrl: './my-journey-panel.component.scss'
})
export class MyJourneyPanelComponent implements OnInit, OnDestroy {
  readonly onClose = output<void>();
  readonly onScrollToPhase = output<number>();

  readonly progress = inject(ProgressService);
  readonly dataService = inject(DataService);

  confirmReset = signal(false);

  readonly totalMovies = 37;
  readonly circumference = 2 * Math.PI * 52;

  get dashOffset(): number {
    return this.circumference * (1 - this.progress.watchedCount() / this.totalMovies);
  }

  infinitySagaIds = [
    'iron-man-2008','incredible-hulk-2008','iron-man-2-2010','thor-2011',
    'captain-america-first-avenger-2011','avengers-2012','iron-man-3-2013',
    'thor-dark-world-2013','captain-america-winter-soldier-2014','guardians-of-the-galaxy-2014',
    'avengers-age-of-ultron-2015','ant-man-2015','captain-america-civil-war-2016',
    'doctor-strange-2016','guardians-of-the-galaxy-vol2-2017','spider-man-homecoming-2017',
    'thor-ragnarok-2017','black-panther-2018','avengers-infinity-war-2018',
    'ant-man-and-the-wasp-2018','captain-marvel-2019','avengers-endgame-2019',
    'spider-man-far-from-home-2019'
  ];

  multiverseSagaIds = [
    'black-widow-2021','shang-chi-2021','eternals-2021','spider-man-no-way-home-2021',
    'doctor-strange-multiverse-of-madness-2022','thor-love-and-thunder-2022',
    'black-panther-wakanda-forever-2022','ant-man-quantumania-2023',
    'guardians-of-the-galaxy-vol3-2023','the-marvels-2023','deadpool-and-wolverine-2024',
    'captain-america-brave-new-world-2025','thunderbolts-2025','fantastic-four-first-steps-2025'
  ];

  infinitySagaWatched = computed(() =>
    this.infinitySagaIds.filter(id => this.progress.isWatched(id)()).length
  );

  multiverseSagaWatched = computed(() =>
    this.multiverseSagaIds.filter(id => this.progress.isWatched(id)()).length
  );

  phaseWatched(phaseId: number) {
    const phase = this.dataService.phases().find(p => p.id === phaseId);
    if (!phase) return 0;
    return this.progress.watchedCountForPhase(phase.movies.map(m => m.id))();
  }

  phaseTotal(phaseId: number) {
    return this.dataService.phases().find(p => p.id === phaseId)?.totalMovies ?? 0;
  }

  phaseIsComplete(phaseId: number) {
    return this.phaseWatched(phaseId) === this.phaseTotal(phaseId) && this.phaseTotal(phaseId) > 0;
  }

  recentlyWatched = computed(() => {
    const watched = this.progress.watchedMovies();
    const movies = this.dataService.allMovies();
    return watched.slice(-5).reverse().map(id => movies.find(m => m.id === id)).filter(Boolean);
  });

  exploredChars = computed(() => {
    const explored = new Set(this.progress.exploredCharacters());
    return this.dataService.characters().map(c => ({ ...c, explored: explored.has(c.id) }));
  });

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  scrollToPhase(id: number): void {
    this.onScrollToPhase.emit(id);
    this.onClose.emit();
  }

  startReset(): void { this.confirmReset.set(true); }
  cancelReset(): void { this.confirmReset.set(false); }

  doReset(): void {
    this.progress.resetProgress();
    this.confirmReset.set(false);
    this.onClose.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.onClose.emit(); }

  ngOnInit(): void { document.body.style.overflow = 'hidden'; }
  ngOnDestroy(): void { document.body.style.overflow = ''; }
}
