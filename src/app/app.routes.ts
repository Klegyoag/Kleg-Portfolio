import { Routes } from '@angular/router';
import { PortfolioComponent } from './components/portfolio.component';
import { ProjectDetailComponent } from './components/project-detail.component';
import { AdminLoginComponent } from './admin/login.component';
import { AdminDashboardComponent } from './admin/dashboard.component';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', component: PortfolioComponent, title: 'Chris Klegar Yoag — Portfolio' },
  { path: 'projects/:slug', component: ProjectDetailComponent, title: 'Project — Klegar Portfolio' },
  { path: 'admin/login', component: AdminLoginComponent, title: 'Portfolio Studio — Sign in' },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'Portfolio Studio — Dashboard' },
  { path: '**', redirectTo: '' }
];
