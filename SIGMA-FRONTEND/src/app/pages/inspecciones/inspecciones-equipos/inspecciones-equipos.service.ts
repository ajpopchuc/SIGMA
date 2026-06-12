import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

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


@Injectable({
  providedIn: 'root'
})
export class InspeccionesEquiposService{ 
  private allUrl = `${API_URL}inspecciones/equipos`;
  private info_general = `${API_URL}inspecciones/informacion_general_equipos`;
  private allUrlUbicaciones = `${API_URL}inspecciones/ubicacionesInfraestructura`;
  private createUrl = `${API_URL}inspecciones/crear/equipos`;
  private baseUrl = `${API_URL}calendarizacion`;
  private updateUrl = `${API_URL}/actualizar`;
  private changeUrl = `${API_URL}/cambiar`;
  private allActivosUrl = `${API_URL}activos/todos`;
  private allRecursosUrl = `${API_URL}recursos/todos`;
  private baseUrlInspecciones = `${API_URL}inspecciones/`;

  constructor(private http: HttpClient) {}

  getInspeccione(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  getInspeccioneInformacion(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(`${this.info_general}/${id}`, { headers }).pipe();
  }

  getUbicaciones(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allUrlUbicaciones, { headers }).pipe();
  }

  actualizarInspeccion(id: number, data: any): Observable<any> {
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
      .set('apellido', data.apellido)
      .set('usuario', data.usuario)
      .set('correo_electronico', data.correo_electronico)
      .set('id_rol', data.rol);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe(
    );
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


  getActivos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allActivosUrl, { headers }).pipe();
  }

  getRecursos(): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.get<any>(this.allRecursosUrl, { headers }).pipe();
  }

  crearInspeccionInfraestructura(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    
    const formData = new FormData();
    
    formData.append('id_calendario', data.id_calendario);
    data.fotografia_inicial.forEach((file: File) => {
      formData.append('fotografia_inicial[]', file, file.name);
    });
    formData.append('id_instalacion', data.id_instalacion.toString());
    formData.append('elementos', data.elementos);
    formData.append('tipo', data.tipo);
    formData.append('cantidad_inspeccion', data.cantidad_inspeccion);
    formData.append('unidad_medida', data.unidad_medida);
    formData.append('motivo', data.motivo);
    formData.append('descripcion', data.descripcion);
    formData.append('condicionGeneral', data.condicionGeneral);
  
    // Convertir deterioroDatas a JSON con las claves correctas antes de agregarlo al FormData
    const formattedDeterioroDatas = data.deterioroDatas.map((deterioro: any) => ({
      id: deterioro.id,
      nombre: deterioro.nombre,
      condicion: deterioro.condicion,
      observaciones: deterioro.observaciones
    }));
    formData.append('deterioroDatas', JSON.stringify(formattedDeterioroDatas));
  
    formData.append('plazoIntervencion', data.plazoIntervencion);
    formData.append('intervencion', data.intervencion);
    formData.append('plazo', data.plazo);
    formData.append('observacionesGenerales', data.observacionesGenerales);
    data.fotografia_final.forEach((file: File) => {
      formData.append('fotografia_final[]', file, file.name);
    });
    // Añadir fotografias_adicionales como múltiples archivos
    data.fotografias_adicionales.forEach((file: File) => {
      formData.append('fotografias_adicionales[]', file, file.name);
    });
  
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion.toString());
    return this.http.post<any>(this.createUrl, formData, { headers });
  }

  paso1(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);
    // Validar que fotografia_inicial es un array
    if (Array.isArray(data.fotografia_inicial)) {
      data.fotografia_inicial.forEach((file: File) => {
        formData.append('fotografia_inicial[]', file, file.name);
      });
    } else {
      console.error('Error: fotografia_inicial no es un array o está undefined');
    }
    formData.append('motivo', data.motivo);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('tipo_inspeccion', data.tipo_inspeccion);
    return this.http.post<any>(this.baseUrlInspecciones+'paso1', formData, { headers });
  }
  paso2(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);

    // Campos específicos de paso3
      formData.append('elementos', data.elementos);
      formData.append('cantidad_inspeccion', data.cantidad_inspeccion);
      formData.append('unidad_medida', data.unidad_medida);
      formData.append('tipo', data.tipo);
      formData.append('descripcion', data.descripcion);
      formData.append('id_instalacion', data.id_instalacion);
    return this.http.post<any>(`${this.baseUrlInspecciones}equipo/paso2`, formData, { headers });
  }

  paso3(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);
    const formattedDeterioroDatas = data.deterioroDatas.map((deterioro: any) => ({
      id: deterioro.id,
      nombre: deterioro.nombre,
      condicion: deterioro.condicion,
      observaciones: deterioro.observaciones
    }));
    formData.append('deterioroDatas', JSON.stringify(formattedDeterioroDatas));
  
    return this.http.post<any>(this.baseUrlInspecciones+'paso4', formData, { headers });
  }
  paso4(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);
    formData.append('condicionGeneral', data.condicionGeneral);
    formData.append('plazoIntervencion', data.plazoIntervencion);
    formData.append('intervencion', data.intervencion);
    formData.append('plazo', data.plazo);
    formData.append('observacionesGenerales', data.observacionesGenerales);

  
    return this.http.post<any>(this.baseUrlInspecciones+'paso5', formData, { headers });
  }
  paso5(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);
    if (Array.isArray(data.fotografia_final)) {
      data.fotografia_final.forEach((file: File) => {
        formData.append('fotografia_final[]', file, file.name);
      });
    } else {
      console.error('Error: fotografia_final no es un array o está undefined');
    }
  
    return this.http.post<any>(this.baseUrlInspecciones+'paso6', formData, { headers });
  }
  paso6(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', data.id_calendario);
    formData.append('tiempo_ejecucion', data.tiempo_ejecucion);
    formData.append('pasoActividad', data.pasoActividad);
    data.fotografias_adicionales.forEach((file: File) => {
      formData.append('fotografias_adicionales[]', file, file.name);
    });
    return this.http.post<any>(this.baseUrlInspecciones+'paso7', formData, { headers });
  }
  pasoFinal(id_calendario: number ): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  
    const formData = new FormData();
    formData.append('id_calendario', id_calendario.toString());
    return this.http.post<any>(this.baseUrlInspecciones+'paso8', formData, { headers });
  }
}