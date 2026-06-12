import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private inspeccionesTableroUrl = `${API_URL}tablero/inspecciones`;
  private mantenimientoTableroUrl = `${API_URL}tablero/mantenimietnos`;
  private supervisionesTableroUrl = `${API_URL}tablero/superviciones`;


  constructor(private http: HttpClient) {}

  getTableroInspecciones(fechaInicio?: string, fechaFin?: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<any>(this.inspeccionesTableroUrl, { headers, params }).pipe();
  }

  getTableroMantenimientos(fechaInicio?: string, fechaFin?: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<any>(this.mantenimientoTableroUrl, { headers, params }).pipe();
  }

  getTableroSupervisiones(fechaInicio?: string, fechaFin?: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<any>(this.supervisionesTableroUrl, { headers, params }).pipe();
  }
}
