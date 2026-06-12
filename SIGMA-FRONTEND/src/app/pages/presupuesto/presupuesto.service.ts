import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {
  private allUrl = `${API_URL}presupuesto/todos`;
  private createUrl = `${API_URL}presupuesto/crear`;
  private updateUrl = `${API_URL}presupuesto/editar`;
  private changeUrl = `${API_URL}presupuesto/cambiar`;

  constructor(private http: HttpClient) {}

  getPresupuesto(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers });
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers });
  }

  crearPresupuesto(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('monto_presupuesto', data.monto_presupuesto)
      .set('presupuesto_ejecutado', data.presupuesto_ejecutado)
      .set('monto_pendiente', data.monto_pendiente)
      .set('fecha_inicio', data.fecha_inicio.toString())
      .set('fecha_fin', data.fecha_fin.toString())
      .set('area', data.area)
      .set('periodo', 'Anual')
      .set('estado', 'Activo');

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarPresupuesto(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
        throw new Error('Token not found');
    }
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
    .set('monto_presupuesto', data.monto_presupuesto)
    .set('presupuesto_ejecutado', data.presupuesto_ejecutado)
    .set('monto_pendiente', data.monto_pendiente)
    .set('fecha_inicio', data.fecha_inicio.toString())
    .set('fecha_fin', data.fecha_fin.toString())
    .set('area', data.area.toString())
    .set('periodo', "Anual")
    .set('estado', 'Activo');

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }
}