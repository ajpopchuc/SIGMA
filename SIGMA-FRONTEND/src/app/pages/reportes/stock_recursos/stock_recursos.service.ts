// tableroPresupuesto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ReporteService{
  private ReportesUrl = `${API_URL}reportes/stock_recursos`;

  constructor(private http: HttpClient) {}

  getReportes(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.post<any>(this.ReportesUrl, { headers });
  }

}