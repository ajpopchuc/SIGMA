import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('angular17token');

  if (token) {
    router.navigateByUrl('/inicio');
    return false;
  }

  return true;
};