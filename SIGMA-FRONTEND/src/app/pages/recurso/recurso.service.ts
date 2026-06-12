import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../constants/api_url';

export interface AlertasRecursos {
  total: number;
  recursos: {
    id: number;
    nombre: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RecursoService {
  private allUrl = `${API_URL}recursos/todos`;
  private createUrl = `${API_URL}recursos/crear`;
  private updateUrl = `${API_URL}recursos/editar`;
  private changeUrl = `${API_URL}recursos/cambiar`;
  private alertasUrl = `${API_URL}alertas/recursos_stock_minimo`;

  constructor(private http: HttpClient) {}

  getRecursos(): Observable<any> {
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

  crearRecurso(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('codigo', data.codigo)
      .set('nombre', data.nombre)
      .set('area', data.area)
      .set('descripcion', data.descripcion)
      .set('existencias', data.existencias.toString())
      .set('existencias_minimas', data.existencias_minimas.toString())
      .set('existencias_maximas', data.existencias_maximas.toString())
      .set('precio', data.precio.toString())
      .set('estado', 'Activo');

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarRecurso(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
        throw new Error('Token not found');
    }
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('codigo', data.codigo)
      .set('nombre', data.nombre)
      .set('area', data.area)
      .set('descripcion', data.descripcion)
      .set('existencias', data.existencias.toString())
      .set('existencias_minimas', data.existencias_minimas.toString())
      .set('existencias_maximas', data.existencias_maximas.toString())
      .set('precio', data.precio.toString())
      .set('estado', data.estado);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }

  getRecursosStockMinimo(): Observable<AlertasRecursos> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(this.alertasUrl, { headers })
      .pipe(
        map(response => response.data)
      );
  }
}