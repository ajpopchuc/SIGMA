import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PermisosService } from './permisos.service'; // Asegúrate de que la ruta sea correcta

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const permisosService = inject(PermisosService);
  const localData = isPlatformBrowser(platformId) ? localStorage.getItem('angular17token') : null;

  // Si el usuario está en la página de login
  if (state.url === '/login') {
    // Si hay un token, redirigir a inicio
    if (localData) {
      router.navigate(['/inicio']);
      return false; // Evitar el acceso a la página de login
    }
    return true; // Permitir acceso a la página de login si no hay token
  }

  // Si el usuario intenta acceder a otras rutas protegidas
  if (localData) {
    // Recuperar los permisos necesarios desde los datos de la ruta
    const permisosNecesarios = route.data['permisos'] as string[];

    if (permisosNecesarios && permisosNecesarios.length > 0) {
      // Verificar si el usuario tiene los permisos necesarios
      const tienePermiso = permisosService.tieneAlgunPermiso(permisosNecesarios);

      if (tienePermiso) {
        return true; // Permitir acceso a la ruta
      } else {
        // Opcional: Puedes mostrar un mensaje de error o notificación aquí
        router.navigate(['/inicio']); // Redirigir a la página de inicio si no tiene los permisos necesarios
        return false; // Impedir acceso por falta de permisos
      }
    }

    return true; // Permitir acceso si no se requieren permisos específicos
  } else {
    // Si no hay token, redirigir a la página de login
    router.navigate(['/login']);
    return false; // Impedir acceso a rutas protegidas
  }
};
