// tableroPresupuesto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ReporteService{
  private ReportesUrl = `${API_URL}reportes/gasto_total`;

  constructor(private http: HttpClient) {}

  getReportes(fecha_inicio: any, fecha_fin: any, categoria: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
      const body = {
        fecha_inicio,
        fecha_fin,
        categoria
      }
    return this.http.post<any>(this.ReportesUrl, body, { headers });
  }

}