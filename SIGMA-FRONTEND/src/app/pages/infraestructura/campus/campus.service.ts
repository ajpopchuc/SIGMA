import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';



@Injectable({
  providedIn: 'root'
})
export class CampusService {
  private allUrl = `${API_URL}campus/todos`;
  private createUrl = `${API_URL}campus/crear`;
  private updateUrl = `${API_URL}campus/editar`;
  private changeUrl = `${API_URL}campus/cambiar`;

  constructor(private http: HttpClient) {}



  getCampus(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe(
    );
  }

  crearCampus(data: any): Observable<any> {
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
      .set('descripcion', data.descripcion);

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarCampus(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
        throw new Error('Token not found');
    }
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    // Crear el cuerpo de la solicitud
    const body = new HttpParams()
      .set('nombre', data.nombre)
      .set('descripcion', data.descripcion);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
}




}
