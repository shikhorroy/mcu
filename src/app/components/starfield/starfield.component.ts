import { Component, ElementRef, OnInit, OnDestroy, ViewChild, afterNextRender, inject } from '@angular/core';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-starfield',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: -1;
      pointer-events: none;
    }
  `]
})
export class StarfieldComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animId = 0;
  private stars: Star[] = [];
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.init();
    });
  }

  private init(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 80 : 200;

    this.resize(canvas);

    this.stars = Array.from({ length: count }, () => this.createStar(canvas.width, canvas.height));

    this.resizeObserver = new ResizeObserver(() => {
      this.resize(canvas);
    });
    this.resizeObserver.observe(document.body);

    this.animate(canvas);
  }

  private createStar(w: number, h: number): Star {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.3
    };
  }

  private resize(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private animate(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of this.stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 230, 211, ${s.opacity})`;
        ctx.fill();
      }
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.resizeObserver?.disconnect();
  }
}
