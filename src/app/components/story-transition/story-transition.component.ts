import { Component, input } from '@angular/core';
import { StoryThreadService, StoryThread } from '../../services/story-thread.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-story-transition',
  standalone: true,
  templateUrl: './story-transition.component.html',
  styleUrl: './story-transition.component.scss'
})
export class StoryTransitionComponent {
  readonly fromPhase = input.required<number>();
  readonly toPhase = input.required<number>();

  private threadService = inject(StoryThreadService);

  get threads(): StoryThread[] {
    return this.threadService.getThreadsForTransition(this.fromPhase(), this.toPhase());
  }

  get isSnapTransition(): boolean {
    return this.fromPhase() === 3;
  }

  typeClass(type: string): string {
    return `thread-${type.replace('_', '-')}`;
  }
}
