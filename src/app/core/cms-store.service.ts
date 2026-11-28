import { Injectable, inject, signal } from '@angular/core';
import { DEFAULT_CONTENT } from '../data/default-content';
import { PortfolioContent, deepClone } from '../models/content';
import { resolvePortfolioContent } from '../data/resolve-content';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CmsStoreService {
  private readonly db = inject(SupabaseService);
  readonly content = signal<PortfolioContent>(deepClone(DEFAULT_CONTENT));
  readonly loaded = signal(false);
  readonly error = signal('');
  private inFlight: Promise<void> | null = null;

  loadPublished(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      if (!this.db.configured) {
        this.loaded.set(true);
        return;
      }
      try {
        const row = await this.db.content('published');
        if (row?.payload) this.content.set(resolvePortfolioContent(DEFAULT_CONTENT, row.payload));
        this.error.set('');
      } catch (error) {
        // Public portfolio must work if Supabase is temporarily offline.
        this.error.set(error instanceof Error ? error.message : 'Content service unavailable');
        console.warn('Using local portfolio defaults:', error);
      } finally {
        this.loaded.set(true);
      }
    })();
    return this.inFlight;
  }
}
