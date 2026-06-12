import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';



@Injectable({
  providedIn: 'root'
})
export class EdificioService {
  private allUrl = `${API_URL}edificios/todos`;
  private campusUlr = `${API_URL}edificios/campus`;
  private createUrl = `${API_URL}edificios/crear`;
  private updateUrl = `${API_URL}edificios/editar`;
  private changeUrl = `${API_URL}edificios/cambiar`;

  constructor(private http: HttpClient) {}



  getEdificios(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  getCampus(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.campusUlr, { headers }).pipe();
  }


  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe(
    );
  }

  crearEdificios(data: any): Observable<any> {
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
      .set('id_campus', data.id_campus);

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarEdificio(id: number, data: any): Observable<any> {
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
      .set('descripcion', data.descripcion)
      .set('id_campus', data.id_campus);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
}




}
