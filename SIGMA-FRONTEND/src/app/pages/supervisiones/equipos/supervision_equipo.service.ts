import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo_electronico: string;
  estado: string;
  rol: string;
  id_empleado: number;
  id_rol: number;
  created_at?: string;
  updated_at?: string;
  actions: string;
}

export interface Actividad {
  id?: number;
  fecha_inicio: string;
  fecha_final: string;
  es_recurrente: boolean;
  tiempo_recurrencia: number;
  observaciones: string;
  tipo_actividad: string;
  id_usuario: number;
  estado: string;
  id_inspeccion: number;
  id_mantenimiento: number;
  id_supervision: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {
  private allUrl = `${API_URL}supervisiones/equipos`;
  private allUrlUbicaciones = `${API_URL}inspecciones/ubicacionesInfraestructura`;
  private allActivosUrl = `${API_URL}activos/todos`;
  private allRecursosUrl = `${API_URL}recursos/todos`;
  private detalleUrl = `${API_URL}supervisiones/detalle`;
  private createUrl = `${API_URL}supervisiones/registrar`;
  private baseUrl = `${API_URL}calendarizacion`;

  constructor(private http: HttpClient) {}

  getSupervision(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  getSupervisionDetalle(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(`${this.detalleUrl}/${id}`, { headers }).pipe();
  }

  crearSupervision(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    const formData = new FormData();
    data.fotografia_inicial.forEach((file: File) => {
      formData.append('fotografia_inicial[]', file, file.name);
    });
    formData.append('id_mantenimiento', data.id_mantenimiento);
    formData.append('id_calendario', data.id_calendario);
    formData.append('descripcion', data.descripcion);
    formData.append('resumen_actividad', data.resumen_actividad);
    formData.append('observaciones', data.observaciones);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('lugar_mantenimiento', data.lugar_mantenimiento);
    data.fotografia_final.forEach((file: File) => {
      formData.append('fotografia_final[]', file, file.name);
    });
    data.fotografias_adicionales.forEach((file: File) => {
      formData.append('fotografias_adicionales[]', file, file.name);
    });

    return this.http.post<any>(this.createUrl, formData, { headers }).pipe();
  }
  getUbicaciones(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrlUbicaciones, { headers }).pipe();
  }

  getActivos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allActivosUrl, { headers }).pipe();
  }

  getUsuarios(): Observable<Usuario[]> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.get<Usuario[]>(`${API_URL}usuarios/todos`, { headers }).pipe();
  }

  crearActividad(actividad: Actividad): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.post<any>(`${this.baseUrl}/crear`, actividad, { headers }).pipe();
  }

  getRecursos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allRecursosUrl, { headers }).pipe();
  }



  // Métodos adicionales como getUbicaciones, getActivos y getRecursos
  // pueden mantenerse o modificarse según la necesidad.
}
