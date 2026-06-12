// tableroPresupuesto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class TableroPresupuestoService{
  private presupuestosActivosUrl = `${API_URL}presupuesto/activos`;
  private comprasByPresupuestoUrl = `${API_URL}compras/getByPresupuesto`;

  constructor(private http: HttpClient) {}

  getPresupuestosActivos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.get<any>(this.presupuestosActivosUrl, { headers });
  }

  getComprasByPresupuesto(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.get<any>(`${this.comprasByPresupuestoUrl}/${id}`, { headers });
  }
}