// custom.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
export const newcustomInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const token = localStorage.getItem('angular17token');
  const clonedRequest = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(clonedRequest).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Sesión expirada',
          text: 'La sesión ha expirado, por favor inicie sesión nuevamente.'
        });
        localStorage.removeItem('angular17token');
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('nombre_usuario');
        localStorage.removeItem('rol');
        localStorage.removeItem('permisosUsuario');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
  
};
