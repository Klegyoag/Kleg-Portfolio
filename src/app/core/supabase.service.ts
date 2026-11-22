import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments';
import { CmsRow, PortfolioContent, Revision } from '../models/content';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly configured: boolean;
  readonly client: SupabaseClient | null;

  constructor() {
    const url = environment.supabaseUrl.trim();
    const key = environment.supabasePublishableKey.trim();
    this.configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
      key.length > 20 && !key.includes('YOUR_') && !/^(sb_secret_|eyJ.*service_role)/.test(key);
    this.client = this.configured ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    }) : null;
  }

  private requireClient(): SupabaseClient {
    if (!this.client) throw new Error('Supabase is not configured. Edit src/environments.ts first.');
    return this.client;
  }

  async user(): Promise<User | null> {
    const client = this.client;
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.user();
    if (!user || !this.client) return false;
    const { data, error } = await this.client.from('cms_admins')
      .select('user_id').eq('user_id', user.id).limit(1);
    if (error) return false;
    return !!data?.length;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!await this.isAdmin()) {
      await this.requireClient().auth.signOut();
      throw new Error('Signed in, but this account is not on the CMS administrator list.');
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.requireClient().auth.signOut();
    if (error) throw error;
  }

  async content(key: 'draft' | 'published'): Promise<CmsRow | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.from('cms_content')
      .select('key,payload,updated_at').eq('key', key).maybeSingle();
    if (error) throw error;
    return data as CmsRow | null;
  }

  async saveContent(key: 'draft' | 'published', payload: PortfolioContent): Promise<void> {
    const user = await this.user();
    if (!user) throw new Error('Please sign in again.');
    const { error } = await this.requireClient().from('cms_content').upsert({
      key, payload, is_published: key === 'published', updated_by: user.id
    }, { onConflict: 'key' });
    if (error) throw error;
  }

  async revisions(): Promise<Revision[]> {
    const { data, error } = await this.requireClient().from('cms_revisions')
      .select('id,payload,published_at').order('published_at', { ascending: false }).limit(15);
    if (error) throw error;
    return (data || []) as Revision[];
  }

  async recordRevision(payload: PortfolioContent): Promise<void> {
    const user = await this.user();
    if (!user) throw new Error('Please sign in again.');
    const { error } = await this.requireClient().from('cms_revisions')
      .insert({ payload, published_by: user.id });
    if (error) throw error;
  }

  async upload(file: File): Promise<string> {
    const client = this.requireClient();
    const user = await this.user();
    if (!user) throw new Error('Please sign in again.');
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) throw new Error('Upload a PNG, JPG, WebP, GIF or PDF file.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Files must be 5 MB or smaller.');
    const filename = file.name.toLowerCase().replace(/[^a-z0-9_.-]/g, '-').slice(-90);
    const path = `${user.id}/${crypto.randomUUID()}-${filename}`;
    const { error } = await client.storage.from('portfolio-media').upload(path, file, {
      cacheControl: '31536000', contentType: file.type, upsert: false
    });
    if (error) throw error;
    return client.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
  }
}
