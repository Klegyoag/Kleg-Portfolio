import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { PortfolioComponent } from './components/portfolio.component';
import { ProjectDetailComponent } from './components/project-detail.component';
import { AdminLoginComponent } from './admin/login.component';
import { AdminDashboardComponent } from './admin/dashboard.component';
import { adminGuard } from './core/admin.guard';

/** These are public section URLs; project details and /admin stay separate. */
const portfolioSections = [
  'home', 'about', 'services', 'skills', 'projects',
  'journey', 'contact'
] as const;

const sectionGuard: CanActivateFn = route => {
  const section = route.paramMap.get('section');
  return section !== null && portfolioSections.some(item => item === section)
    ? true
    : inject(Router).parseUrl('/home');
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Keep more specific routes BEFORE :section.
  {
    path: 'projects/:slug',
    component: ProjectDetailComponent,
    title: 'Project — Klegar Portfolio'
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    title: 'Portfolio Studio — Sign in'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    title: 'Portfolio Studio — Dashboard'
  },

  // Redirect bookmarks from retired presentation-only sections.
  { path: 'design', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'lab', pathMatch: 'full', redirectTo: 'skills' },
  { path: 'principles', pathMatch: 'full', redirectTo: 'about' },

  // Reuse one portfolio component, preserving the current one-page layout.
  {
    path: ':section',
    component: PortfolioComponent,
    canActivate: [sectionGuard],
    title: 'Chris Klegar Yoag — Portfolio'
  },

  { path: '**', redirectTo: 'home' }
];
