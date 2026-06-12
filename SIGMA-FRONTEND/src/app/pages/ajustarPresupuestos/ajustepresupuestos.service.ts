import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ajustePresupuestosService {
  private allUrl = `${API_URL}ajustePresupuestos/todos`;
  private createUrl = `${API_URL}ajustePresupuestos/crear`;
  private updateUrl = `${API_URL}ajustePresupuestos/editar`;
  private changeUrl = `${API_URL}ajustePresupuestos/cambiar`;

  constructor(private http: HttpClient) {}

  getAjustePresupuestos(): Observable<any> {
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

  crearAjustePresupuestos(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('area', data.area)
      .set('id_presupuesto', data.id_presupuesto)
      .set('cantidad', data.cantidad)
      .set('tipo', data.tipo)
      .set('motivo', data.motivo.toString())

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarAjustePresupuestos(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
        throw new Error('Token not found');
    }
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
    .set('area', data.area)
    .set('id_presupuesto', data.id_presupuesto)
    .set('cantidad', data.cantidad)
    .set('tipo', data.tipo)
    .set('motivo', data.motivo.toString())

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }
}