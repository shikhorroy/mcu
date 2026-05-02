import { Component, input, output, inject, signal, OnInit, OnDestroy, ElementRef, afterNextRender } from '@angular/core';
import { Character } from '../../models/mcu.models';
import { ProgressService } from '../../services/progress.service';
import { UnsplashService } from '../../services/unsplash.service';
@Component({
  selector: 'app-character-graph',
  standalone: true,
  imports: [],
  templateUrl: './character-graph.component.html',
  styleUrl: './character-graph.component.scss'
})
export class CharacterGraphComponent implements OnInit, OnDestroy {
  readonly characters = input<Character[]>([]);
  readonly onCharacterClick = output<string>();

  private el = inject(ElementRef);
  readonly progress = inject(ProgressService);
  readonly unsplash = inject(UnsplashService);

  isMobile = signal(false);
  portraitCache = signal<Record<string, string>>({});
  private resizeListener?: () => void;
  tooltip = signal<{ x: number; y: number; char: Character } | null>(null);
  private svg?: SVGSVGElement;
  private simulation?: any;

  constructor() {
    afterNextRender(() => {
      this.checkMobile();
      if (!this.isMobile()) {
        this.initD3();
      } else {
        this.loadMobilePortraits();
      }
    });
  }

   private loadMobilePortraits(): void {
     const cache: Record<string, string> = {};
     for (const c of this.characters()) {
       // Use local imagePath first, fall back to Unsplash
       cache[c.id] = c.imagePath || this.unsplash.getCharacterImage(c.id);
     }
     this.portraitCache.set(cache);
   }

  onMobilePortraitLoad(event: Event): void {
    (event.target as HTMLImageElement).classList.add('loaded');
  }

  onMobilePortraitError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getPortrait(charId: string): string | null {
    return this.portraitCache()[charId] ?? null;
  }

  ngOnInit(): void {
    this.resizeListener = () => {
      const wasMobile = this.isMobile();
      this.checkMobile();
      if (!this.isMobile() && wasMobile) {
        setTimeout(() => this.initD3(), 100);
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

   private async initD3(): Promise<void> {
     const container = this.el.nativeElement.querySelector('.graph-container');
     if (!container) return;

     const chars = this.characters();
     if (!chars.length) return;

     try {
       const d3 = await import('d3');
       const width = container.clientWidth || 800;
       const height = 700;

       const existing = container.querySelector('svg');
       if (existing) existing.remove();

       const svg = d3.select(container)
         .append('svg')
         .attr('width', '100%')
         .attr('height', height)
         .attr('viewBox', `0 0 ${width} ${height}`);

       this.svg = svg.node() as SVGSVGElement;

      const links: any[] = [];
      const seen = new Set<string>();
      chars.forEach(c => {
        c.connections.forEach(conn => {
          const key = [c.id, conn.characterId].sort().join('-');
          if (!seen.has(key) && chars.find(ch => ch.id === conn.characterId)) {
            seen.add(key);
            links.push({ source: c.id, target: conn.characterId, type: conn.relationshipType });
          }
        });
      });

      const nodes = chars.map(c => ({
        id: c.id,
        char: c,
        r: Math.min(24 + c.connections.length * 2, 40)
      }));

       const sim = d3.forceSimulation(nodes as any)
         .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
         .force('charge', d3.forceManyBody().strength(-200))
         .force('center', d3.forceCenter(width / 2, height / 2 - 30))
         .force('collide', d3.forceCollide().radius((d: any) => d.r + 10));

      this.simulation = sim;

      sim.tick(300);
      sim.stop();

      const linkColors: Record<string, string> = {
        ally: 'rgba(79,195,247,0.4)',
        enemy: 'rgba(226,54,54,0.4)',
        mentor: 'rgba(201,168,76,0.4)',
        family: 'rgba(102,187,106,0.4)',
        rival: 'rgba(171,71,188,0.4)'
      };

      svg.append('g').selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', (d: any) => linkColors[d.type] || 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1.5)
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

       const nodeG = svg.append('g').selectAll('g')
         .data(nodes as any[])
         .join('g')
         .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
         .style('cursor', 'pointer');

       svg.append('defs').selectAll('clipPath')
         .data(nodes as any[])
         .join('clipPath')
         .attr('id', (d: any) => `clip-${d.id}`)
         .append('circle')
         .attr('r', (d: any) => d.r);

       nodeG.append('circle')
         .attr('r', (d: any) => d.r)
         .attr('fill', (d: any) => d.char.avatarColor)
         .attr('stroke', (d: any) => d.char.side === 'villain' ? 'var(--color-accent-red)' : 'var(--phase-3)')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', (d: any) => d.char.side === 'villain' ? '4,2' : 'none');

       // Add character images
       nodeG.append('image')
         .attr('x', (d: any) => -d.r)
         .attr('y', (d: any) => -d.r)
         .attr('width', (d: any) => d.r * 2)
         .attr('height', (d: any) => d.r * 2)
         .attr('xlink:href', (d: any) => d.char.imagePath || '')
         .attr('preserveAspectRatio', 'xMidYMid slice')
         .attr('clip-path', (d: any) => `url(#clip-${d.id})`)
         .style('opacity', (d: any) => d.char.imagePath ? 1 : 0);


       nodeG.append('text')
         .attr('text-anchor', 'middle')
         .attr('dy', '0.35em')
         .attr('fill', '#fff')
         .attr('font-size', 11)
         .attr('font-weight', 700)
         .attr('pointer-events', 'none')
         .style('opacity', (d: any) => d.char.imagePath ? 0 : 1)
         .text((d: any) => d.char.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase());

       nodeG.append('text')
         .attr('text-anchor', 'middle')
         .attr('dy', (d: any) => d.r + 14)
         .attr('fill', 'var(--color-text-muted)')
         .attr('font-size', 10)
         .attr('pointer-events', 'none')
         .style('opacity', (d: any) => d.char.imagePath ? 0 : 1)
         .text((d: any) => d.char.name.split(' ')[0]);

      const self = this;
      nodeG
        .on('mouseover', function(event: MouseEvent, d: any) {
          d3.select(this).select('circle').transition().attr('r', d.r * 1.3);
          self.tooltip.set({ x: event.clientX, y: event.clientY, char: d.char });
        })
        .on('mousemove', function(event: MouseEvent) {
          const t = self.tooltip();
          if (t) self.tooltip.set({ ...t, x: event.clientX, y: event.clientY });
        })
        .on('mouseout', function(_: MouseEvent, d: any) {
          d3.select(this).select('circle').transition().attr('r', d.r);
          self.tooltip.set(null);
        })
        .on('click', (_: MouseEvent, d: any) => {
          self.onCharacterClick.emit(d.char.id);
        });

      const drag = d3.drag()
        .on('start', (event: any, d: any) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event: any, d: any) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event: any, d: any) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });

      nodeG.call(drag as any);

    } catch {}
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  ngOnDestroy(): void {
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    this.simulation?.stop();
  }
}
