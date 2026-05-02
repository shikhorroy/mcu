import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-phase-coming-soon',
  standalone: true,
  templateUrl: './phase-coming-soon.component.html',
  styleUrl: './phase-coming-soon.component.scss'
})
export class PhaseComingSoonComponent {
  readonly dataService = inject(DataService);
  get comingSoon() { return this.dataService.comingSoon(); }
}
