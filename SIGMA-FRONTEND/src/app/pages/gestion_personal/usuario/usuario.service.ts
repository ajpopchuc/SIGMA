import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private allUrl = `${API_URL}usuarios/todos`;
  private createUrl = `${API_URL}usuarios/registrar`;
  private updateUrl = `${API_URL}usuarios/actualizar`;
  private changeUrl = `${API_URL}usuarios/cambiar`;
  private rolesUrl = `${API_URL}roles/todos`;
  private changePasswordUrl = `${API_URL}usuarios/cambiar_contraseña`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.get<any>(this.allUrl, { headers }).pipe(

    );
  }

  crearUsuario(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('nombre', data.nombre)
      .set('apellido', data.apellido)
      .set('usuario', data.usuario)
      .set('correo_electronico', data.correo_electronico)
      .set('contraseña', data.contraseña)  
      .set('id_rol', data.rol);

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarUsuario(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('nombre', data.nombre)
      .set('apellido', data.apellido)
      .set('usuario', data.usuario)
      .set('correo_electronico', data.correo_electronico)
      .set('id_rol', data.rol);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe(
    );
  }

  getRoles(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(this.rolesUrl, { headers }).pipe(
    );
  }

  cambiarContraseña(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('contrasena', data.currentPassword)
      .set('nueva_contrasena', data.newPassword)
      .set('confirmar_contrasena', data.confirmPassword);

    return this.http.post<any>(`${this.changePasswordUrl}/${data.id_usuario}`, body.toString(), { headers });
  }
}
