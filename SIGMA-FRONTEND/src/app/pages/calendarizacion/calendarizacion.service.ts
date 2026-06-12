// calendarizacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../constants/api_url';

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
  fecha_limite: string;
  pasoActividad: number;
}

export interface AlertasResumen {
  total: number;
  por_tipo: {
    Mantenimiento: number;
    Inspeccion: number;
    Supervision: number;
  };
}

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


export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  backgroundColor: string;
  extendedProps: ExtendedProps;
}

interface ExtendedProps extends Actividad {
  isStart?: boolean;
  isEnd?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarizacionService {
  private baseUrl = `${API_URL}calendarizacion`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('angular17token');
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  }

  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.baseUrl}/todos`, { headers: this.getHeaders() });
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_URL}usuarios/todos`, { headers: this.getHeaders() });
  }

  getActividad(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.baseUrl}/porId/${id}`, { headers: this.getHeaders() });
  }

  crearActividad(actividad: Actividad): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/crear`, actividad, { headers: this.getHeaders() });
  }

  actualizarActividad(id: number, actividad: Actividad): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar/${id}`, actividad, { headers: this.getHeaders() });
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cambiar/${id}`, { headers: this.getHeaders() });
  }

  getAlertasVencidas(): Observable<AlertasResumen> {
    return this.http.get<any>(`${API_URL}alertas/actividades_vencidas`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data)
      );
  }
}