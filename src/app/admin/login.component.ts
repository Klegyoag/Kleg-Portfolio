import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../core/supabase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="studio-auth-page">
      <div class="studio-auth-glow"></div>
      <div class="studio-auth-container">
        <a class="studio-brand" routerLink="/"><span class="studio-mark">K</span><span><strong>KLEGAR STUDIO</strong><small>PRIVATE WORKSPACE</small></span></a>
        <section class="studio-login-card">
          <div class="studio-login-icon">✦</div>
          <p class="studio-overline">SECURE CONTENT WORKSPACE</p>
          <h1>Welcome back<span>.</span></h1>
          <p class="studio-subtext">Sign in to edit, preview and publish your portfolio.</p>
          <div class="studio-alert warning" *ngIf="!db.configured">Supabase isn't connected yet. Update <code>src/environments.ts</code> and deploy again.</div>
          <form (ngSubmit)="signIn()">
            <label>Email address<input type="email" name="email" [(ngModel)]="email" autocomplete="username" required placeholder="you@example.com" [disabled]="busy"></label>
            <label>Password<input type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required placeholder="Enter your password" [disabled]="busy"></label>
            <div class="studio-alert error" role="alert" *ngIf="error">{{ error }}</div>
            <button type="submit" class="studio-button primary" [disabled]="busy || !db.configured || !email || !password">{{ busy ? 'Signing in…' : 'Enter dashboard ↗' }}</button>
          </form>
          <p class="studio-auth-note">Protected by Supabase Authentication and row-level security.</p>
        </section>
        <a routerLink="/" class="studio-back">← Return to portfolio</a>
      </div>
    </main>
  `
})
export class AdminLoginComponent implements OnInit {
  readonly db = inject(SupabaseService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  busy = false;
  error = '';
  async ngOnInit(): Promise<void> {
    if (await this.db.isAdmin()) await this.router.navigateByUrl('/admin');
  }
  async signIn(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      await this.db.signIn(this.email.trim(), this.password);
      this.password = '';
      await this.router.navigateByUrl('/admin');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Sign in failed. Check your account and Supabase configuration.';
    } finally { this.busy = false; }
  }
}
