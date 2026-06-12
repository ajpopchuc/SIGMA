import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class InstalacionesService {
  private allUrl = `${API_URL}instalaciones/todos`;
  private nivelesUrl = `${API_URL}instalaciones/niveles`;
  private createUrl = `${API_URL}instalaciones/crear`;
  private updateUrl = `${API_URL}instalaciones/editar`;
  private changeUrl = `${API_URL}instalaciones/cambiar`;

  constructor(private http: HttpClient) {}

  getInstalaciones(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  getNiveles(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.nivelesUrl, { headers }).pipe();
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe();
  }

  crearInstalaciones(data: any): Observable<any> {
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
    .set('descripcion', data.descripcion)
    .set('tipo_instalacion', data.tipo_instalacion)
    .set('id_nivel', data.id_nivel);

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarInstalaciones(id: number, data: any): Observable<any> {
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
    .set('descripcion', data.descripcion)
    .set('tipo_instalacion', data.tipo_instalacion)
    .set('id_nivel', data.id_nivel);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }
}
