import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CmsStoreService } from '../core/cms-store.service';
import { assetUrl, safeUrl, slugify } from '../models/content';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page">
      <header class="detail-header shell">
        <a routerLink="/home" class="brand"><span class="brand-mark">CK</span><span class="brand-copy"><strong>Chris Klegar</strong><small>Project archive</small></span></a>
        <a class="detail-return" routerLink="/home">← Back to portfolio</a>
      </header>
      <main class="detail-main shell" *ngIf="project as p; else missing">
        <p class="section-label"><span></span>{{ p.category || 'Selected project' }}</p>
        <h1>{{ p.title }}</h1>
        <p class="detail-lead">{{ p.description }}</p>
        <div class="detail-tags"><span *ngFor="let tech of p.stack">{{ tech }}</span></div>
        <div class="detail-actions">
          <a *ngIf="link(p.liveUrl) as live" [href]="live" class="button button-primary" rel="noopener noreferrer" target="_blank">View live project ↗</a>
          <a *ngIf="link(p.githubUrl) as github" [href]="github" class="button button-outline" rel="noopener noreferrer" target="_blank">View source ↗</a>
        </div>
        <div class="detail-cover"><img *ngIf="resource(p.imageUrl) as image; else graphic" [src]="image" [alt]="p.title + ' project preview'"><ng-template #graphic><div class="detail-graphic"><span>CK / PROJECT</span><strong>{{ p.title }}</strong></div></ng-template></div>
        <div class="detail-bottom"><div><small>PROJECT CATEGORY</small><strong>{{ p.category || 'Development' }}</strong></div><div><small>TECHNOLOGY STACK</small><strong>{{ (p.stack || []).join(' · ') }}</strong></div></div>
      </main>
      <ng-template #missing><main class="shell detail-missing"><h1>Project not found.</h1><p>This project may have been unpublished or its title changed.</p><a class="button button-primary" routerLink="/home">Return home ↗</a></main></ng-template>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  private readonly store = inject(CmsStoreService);
  private readonly route = inject(ActivatedRoute);
  readonly resource = assetUrl;
  readonly link = safeUrl;
  get project(): any {
    const key = this.route.snapshot.paramMap.get('slug') || '';
    return (this.store.content().projects.items || []).find((p: any) => p.visible !== false && slugify(p.title) === key);
  }
  async ngOnInit(): Promise<void> { await this.store.loadPublished(); }
}
