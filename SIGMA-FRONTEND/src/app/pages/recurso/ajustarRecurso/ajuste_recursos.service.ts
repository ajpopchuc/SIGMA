import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class AjusteRecursosService {
  private allUrl = `${API_URL}ajusteRecursos/todos`;
  private createUrl = `${API_URL}ajusteRecursos/crear`;
  private getRecursosUrl = `${API_URL}recursos/todos`;

  constructor(private http: HttpClient) {}

  getAjusteRecursos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers });
  }

  crearAjusteRecursos(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('id_recurso', data.id_recurso)
      .set('cantidad', data.cantidad)
      .set('tipo', data.tipo)
      .set('motivo', data.motivo.toString())

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  getRecursos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.getRecursosUrl, { headers });
  }

}