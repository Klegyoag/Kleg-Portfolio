import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../core/supabase.service';
import { CmsStoreService } from '../core/cms-store.service';
import { DEFAULT_CONTENT } from '../data/default-content';
import { needsContentRefresh, resolvePortfolioContent } from '../data/resolve-content';
import { PortfolioComponent } from '../components/portfolio.component';
import { deepClone, mergeContent, PortfolioContent, Revision, SectionKey } from '../models/content';
import { EDITOR_SECTIONS, FieldDef, GroupDef, SectionDef } from './editor-schema';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PortfolioComponent],
  templateUrl: './dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly db = inject(SupabaseService);
  private readonly store = inject(CmsStoreService);
  readonly sections = EDITOR_SECTIONS;
  readonly today = new Date();
  activeId = 'overview';
  sidebarOpen = false;
  email = '';
  loading = true;
  busy = false;
  uploading = false;
  dirty = false;
  previewOpen = false;
  error = '';
  notice = '';
  publishedAt = '';
  draftAt = '';
  draft: PortfolioContent = deepClone(DEFAULT_CONTENT);
  published: PortfolioContent = deepClone(DEFAULT_CONTENT);
  history: Revision[] = [];
  lastPublishWarning = '';
  legacyContentDetected = false;
  legacyDraftBackup: PortfolioContent | null = null;
  legacyPublishedBackup: PortfolioContent | null = null;

  get activeSection(): SectionDef | null {
    return this.sections.find(section => section.id === this.activeId) || null;
  }
  get projectCount(): number { return (this.draft.projects.items || []).length; }
  get visibleProjectCount(): number { return (this.draft.projects.items || []).filter((item: any) => item.visible !== false).length; }
  get skillCount(): number { return (this.draft.skills.items || []).length; }
  get serviceCount(): number { return (this.draft.services.items || []).length; }

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.db.user();
      if (!user || !await this.db.isAdmin()) {
        await this.router.navigateByUrl('/admin/login');
        return;
      }
      this.email = user.email || 'Administrator';
      await this.reload();
    } catch (error) {
      this.error = this.errorText(error);
    } finally { this.loading = false; }
  }

  async reload(): Promise<void> {
    const [published, draft, revisions] = await Promise.all([
      this.db.content('published'), this.db.content('draft'), this.db.revisions()
    ]);
    this.legacyPublishedBackup = needsContentRefresh(published?.payload) ? deepClone(published!.payload) : null;
    this.legacyDraftBackup = needsContentRefresh(draft?.payload) ? deepClone(draft!.payload) : null;
    this.legacyContentDetected = !!(this.legacyPublishedBackup || this.legacyDraftBackup);
    this.published = resolvePortfolioContent(DEFAULT_CONTENT, published?.payload);
    this.draft = resolvePortfolioContent(DEFAULT_CONTENT, draft?.payload || published?.payload);
    this.publishedAt = published?.updated_at || '';
    this.draftAt = draft?.updated_at || '';
    this.history = revisions;
    this.dirty = this.legacyContentDetected;
    this.error = '';
    this.store.content.set(deepClone(this.published));
  }

  choose(id: string): void {
    this.activeId = id;
    this.sidebarOpen = false;
    this.notice = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  value(section: SectionKey, field: FieldDef, itemIndex: number | null = null, property?: string): string | number | boolean {
    const source = itemIndex === null ? this.draft[section] : this.draft[section][property || 'items']?.[itemIndex];
    const raw = source?.[field.key];
    if (field.type === 'checkbox') return !!raw;
    if (field.type === 'lines') return Array.isArray(raw) ? raw.join('\n') : '';
    if (field.type === 'number') return Number(raw ?? 0);
    return String(raw ?? '');
  }

  setField(section: SectionKey, field: FieldDef, value: string | number | boolean, itemIndex: number | null = null, property?: string): void {
    const target = itemIndex === null ? this.draft[section] : this.draft[section][property || 'items']?.[itemIndex];
    if (!target) return;
    if (field.type === 'lines') {
      target[field.key] = String(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    } else if (field.type === 'number') {
      target[field.key] = Math.min(100, Math.max(0, Number(value) || 0));
    } else if (field.type === 'checkbox') {
      target[field.key] = !!value;
    } else {
      target[field.key] = String(value);
    }
    this.dirty = true;
    this.notice = '';
  }

  items(section: SectionKey, property: string): any[] {
    return Array.isArray(this.draft[section][property]) ? this.draft[section][property] : [];
  }

  addItem(section: SectionKey, group: GroupDef): void {
    if (!group.property) return;
    const item: Record<string, any> = {};
    for (const f of group.fields) {
      item[f.key] = f.type === 'checkbox' ? f.key === 'visible' : f.type === 'lines' ? [] : f.type === 'number' ? 70 : '';
    }
    if (!Array.isArray(this.draft[section][group.property])) this.draft[section][group.property] = [];
    this.draft[section][group.property].push(item);
    this.dirty = true;
  }

  removeItem(section: SectionKey, property: string, index: number): void {
    if (!confirm('Remove this item from your draft?')) return;
    this.items(section, property).splice(index, 1);
    this.dirty = true;
  }

  moveItem(section: SectionKey, property: string, index: number, offset: number): void {
    const items = this.items(section, property);
    const next = index + offset;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    this.dirty = true;
  }

  private validate(): void {
    if (!this.draft.site.ownerName?.trim()) throw new Error('Profile owner name is required.');
    if (!this.draft.site.whatsappNumber || !/^\d{8,15}$/.test(String(this.draft.site.whatsappNumber))) {
      throw new Error('WhatsApp number must contain 8–15 digits (no spaces or +).');
    }
    for (const project of this.draft.projects.items || []) {
      if (!project.title?.trim()) throw new Error('Every project card needs a title.');
    }
  }
  async saveDraft(quiet = false): Promise<boolean> {
    if (this.busy) return false;
    this.busy = true;
    this.error = '';
    try {
      this.validate();
      await this.db.saveContent('draft', this.draft);
      this.draftAt = new Date().toISOString();
      this.dirty = false;
      if (!quiet) this.notice = 'Draft saved privately. Visitors still see the published version.';
      return true;
    } catch (error) {
      this.error = 'Draft save failed: ' + this.errorText(error);
      return false;
    } finally { this.busy = false; }
  }
  async publish(): Promise<void> {
    if (this.busy) return;
    if (this.dirty && !await this.saveDraft(true)) return;
    if (!confirm('Publish the current draft to your public portfolio?')) return;
    this.busy = true;
    this.error = '';
    this.lastPublishWarning = '';
    try {
      this.validate();
      await this.db.saveContent('published', this.draft);
      this.published = deepClone(this.draft);
      this.store.content.set(deepClone(this.draft));
      this.publishedAt = new Date().toISOString();
      try {
        await this.db.recordRevision(this.published);
        this.history = await this.db.revisions();
      } catch (error) {
        this.lastPublishWarning = 'Published successfully, but the history entry could not be saved: ' + this.errorText(error);
      }
      this.legacyContentDetected = false;
      this.notice = 'Published! Your live website now reads the updated content from Supabase.';
    } catch (error) {
      this.error = 'Publish failed: ' + this.errorText(error);
    } finally { this.busy = false; }
  }

  restoreRevision(item: Revision): void {
    if (!confirm('Load this historical version into your draft? The public site will not change until you publish.')) return;
    this.draft = mergeContent(DEFAULT_CONTENT, item.payload);
    this.dirty = true;
    this.activeId = 'overview';
    this.notice = 'Historical content loaded into your draft. Review, save and publish when ready.';
  }

  async uploadFile(event: Event, section: SectionKey, field: FieldDef, itemIndex: number | null = null, property?: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    this.uploading = true;
    try {
      if (field.type === 'file' && file.type !== 'application/pdf') throw new Error('Please choose a PDF for the downloadable CV.');
      if (field.type === 'image' && !file.type.startsWith('image/')) throw new Error('Choose an image file for this field.');
      const url = await this.db.upload(file);
      this.setField(section, field, url, itemIndex, property);
      this.notice = 'Media uploaded. Save draft to keep this new link.';
    } catch (error) {
      this.error = 'Upload failed: ' + this.errorText(error);
    } finally {
      this.uploading = false;
      input.value = '';
    }
  }

  exportJson(): void {
    this.downloadBackup(this.draft, 'draft');
  }

  exportLegacy(kind: 'draft' | 'published'): void {
    const snapshot = kind === 'draft' ? this.legacyDraftBackup : this.legacyPublishedBackup;
    if (snapshot) this.downloadBackup(snapshot, `legacy-${kind}`);
  }

  private downloadBackup(snapshot: PortfolioContent, label: string): void {
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klegar-portfolio-${label}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importJson(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('Backup is too large (1 MB maximum).');
      const data: unknown = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid backup format.');
      const record = data as Record<string, any>;
      if (!record.site || !record.hero || !record.projects) throw new Error('Not a portfolio CMS backup.');
      this.draft = mergeContent(DEFAULT_CONTENT, data);
      this.dirty = true;
      this.notice = 'Backup imported into your local draft. Save draft to persist it.';
    } catch (error) { this.error = this.errorText(error); }
    input.value = '';
  }

  async logout(): Promise<void> {
    await this.db.signOut();
    await this.router.navigateByUrl('/admin/login');
  }
  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
