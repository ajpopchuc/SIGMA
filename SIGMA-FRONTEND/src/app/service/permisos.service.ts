import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private permisos: string[] = [];

  constructor() {
    // Recupera los permisos desde localStorage al iniciar el servicio
    const permisosGuardados = localStorage.getItem('permisosUsuario');
    if (permisosGuardados) {
      this.permisos = JSON.parse(permisosGuardados);
    }
  }

  // Método para establecer permisos
  setearPermiso(permisos: string[]) {
    this.permisos = permisos;
    localStorage.setItem('permisosUsuario', JSON.stringify(permisos));
  }

  // Método para verificar si el usuario tiene un permiso específico
  permisoEspecifico(permisos: string): boolean {
    return this.permisos.includes(permisos);
  }

  // Método para verificar si el usuario tiene al menos uno de los permisos dados
  tieneAlgunPermiso(permisos: string[]): boolean {
    return permisos.some(permisos => this.permisos.includes(permisos));
  }
}