import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
export class MantenimientoService {
  private allUrl = `${API_URL}mantenimientos/infraestructura`;
  private allUrlUbicaciones = `${API_URL}inspecciones/ubicacionesInfraestructura`;
  private allRecursosUrl = `${API_URL}recursos/todos`;
  private detalleUrl = `${API_URL}mantenimientos/detalle`;
  private createUrl = `${API_URL}mantenimientos/registrar`;
  private baseUrl = `${API_URL}calendarizacion`;


  constructor(private http: HttpClient) {}

  getMantenimiento(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  getMantenimientoDetalle(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(`${this.detalleUrl}/${id}`, { headers }).pipe();
  }

  crearMantenimientoPaso1(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    data.fotografia_inicial.forEach((file: File) => {
      formData.append('fotografia_inicial[]', file, file.name);
    }),
    formData.append('tipo_mantenimiento', data.tipo_mantenimiento);
    formData.append('motivo_actividad', data.motivo_actividad);
    formData.append('lugar_mantenimiento', data.lugar_mantenimiento);
    formData.append('id_calendario', data.id_calendario);
    return this.http.post<any>(`${this.createUrl}/1`, formData, { headers }).pipe();
  }

  crearMantenimientoPaso2(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    formData.append('id_instalacion', data.id_instalacion);
    formData.append('id_activos', data.id_activos);
    formData.append('nivel_atendido', data.nivel_atendido);
    formData.append('tipo', data.tipo);
    formData.append('cantidad_atendida', data.cantidad_atendida);
    formData.append('unidad_medida', data.unidad_medida);
    formData.append('descripcion', data.descripcion);
    formData.append('id_calendario', data.id_calendario);
    return this.http.post<any>(`${this.createUrl}/2`, formData, { headers }).pipe();
  }

  crearMantenimientoPaso3(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    formData.append('monto_total', data.monto_total);
    formData.append('observaciones', data.observaciones);
    formData.append('id_calendario', data.id_calendario);
    const detalle_mantenimiento = data.detalle_mantenimiento.map((detalle: any) => ({
      codigo : detalle.codigo,
      material_o_servicio : detalle.material_o_servicio,
      id_recurso : detalle.id_recurso,
      cantidad : detalle.cantidad,
      unidad : detalle.unidad,
      precio_unitario : detalle.precio_unitario,
      total : detalle.total
    }));
    formData.append('detalle_mantenimiento', JSON.stringify(detalle_mantenimiento));
    return this.http.post<any>(`${this.createUrl}/3`, formData, { headers }).pipe();
  }

  crearMantenimientoPaso4(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    data.fotografia_final.forEach((file: File) => {
      formData.append('fotografia_final[]', file, file.name);
    }),
    formData.append('id_calendario', data.id_calendario);
    return this.http.post<any>(`${this.createUrl}/4`, formData, { headers }).pipe();
  }

  crearMantenimientoPaso5(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    data.fotografias_adicionales.forEach((file: File) => {
      formData.append('fotografias_adicionales[]', file, file.name);
    }),
    formData.append('id_calendario', data.id_calendario);
    return this.http.post<any>(`${this.createUrl}/5`, formData, { headers }).pipe();
  }

  crearMantenimientoPaso6(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')

    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    const detalle_mantenimiento = Array.isArray(data.detalle_mantenimiento)
      ? data.detalle_mantenimiento.map((detalle: any) => ({
          codigo: detalle.codigo,
          material_o_servicio: detalle.material_o_servicio,
          id_recurso: detalle.id_recurso,
          cantidad: detalle.cantidad,
          unidad: detalle.unidad,
          precio_unitario: detalle.precio_unitario,
          total: detalle.total
        }))
      : [];
    formData.append('detalle_mantenimiento', JSON.stringify(detalle_mantenimiento));
    formData.append('lugar_mantenimiento', data.lugar_mantenimiento);
    return this.http.post<any>(`${this.createUrl}/6`, formData, { headers }).pipe();
  }



  getUbicaciones(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrlUbicaciones, { headers }).pipe();
  }

  getRecursos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allRecursosUrl, { headers }).pipe();
  }

  crearActividad(actividad: Actividad): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.post<any>(`${this.baseUrl}/crear`, actividad, { headers }).pipe();
  }

  getUsuarios(): Observable<Usuario[]> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    return this.http.get<Usuario[]>(`${API_URL}usuarios/todos`, { headers }).pipe();
  }


}
