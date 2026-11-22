import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const database = inject(SupabaseService);
  const router = inject(Router);
  try {
    return await database.isAdmin() ? true : router.createUrlTree(['/admin/login']);
  } catch {
    return router.createUrlTree(['/admin/login']);
  }
};
