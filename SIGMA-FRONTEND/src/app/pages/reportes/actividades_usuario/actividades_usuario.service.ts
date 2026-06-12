// tableroPresupuesto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ReporteService{
  private usuariosUrl = `${API_URL}reportes/usuarios`;
  private actividadesUrl = `${API_URL}reportes/actividades_usuario`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.get<any>(this.usuariosUrl, { headers });
  }

  getActividades(id_usuario: number, tipo_actividad: string, fecha_inicio: string, fecha_fin: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    const body = {
      id_usuario,
      tipo_actividad,
      fecha_inicio,
      fecha_fin
    };

    return this.http.post<any>(this.actividadesUrl, body, { headers });
  }
}