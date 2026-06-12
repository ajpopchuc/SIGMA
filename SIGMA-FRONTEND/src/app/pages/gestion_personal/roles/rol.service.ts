import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private allUrl = `${API_URL}roles/todos`;
  private createUrl = `${API_URL}roles/registrar`;
  private updateUrl = `${API_URL}roles/actualizar`;
  private permisosUrl = `${API_URL}permisos`;
  private permisosAsignadosUrl = `${API_URL}permisos/rol`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  crearRol(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  
    return this.http.post<any>(this.createUrl, data, { headers });
  }

  actualizarRol(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.updateUrl}/${id}`, data, { headers });
  }

  getPermisos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(this.permisosUrl, { headers }).pipe(
    );
  }

  getPermisosAsignados(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.permisosAsignadosUrl}/${id}`, { headers }).pipe(
    );
  }
}
