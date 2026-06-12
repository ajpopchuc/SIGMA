import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private allUrl = `${API_URL}proveedores/todos`;
  private createUrl = `${API_URL}proveedores/crear`;
  private updateUrl = `${API_URL}proveedores/editar`;
  private changeUrl = `${API_URL}proveedores/cambiar`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<any> {
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

  crearProveedor(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('nombre_proveedor', data.nombre_proveedor)
      .set('nombre_persona_contacto', data.nombre_persona_contacto)
      .set('correo_contacto', data.correo_contacto)
      .set('pbx', data.pbx)
      .set('telefono_persona_contacto', data.telefono_persona_contacto)
      .set('direccion', data.direccion)
      .set('descripcion', data.descripcion)
      .set('tipo_proveedor', data.tipo_proveedor)
      .set('estado', 'Activo');

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

  actualizarProveedor(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams()
      .set('nombre_proveedor', data.nombre_proveedor)
      .set('nombre_persona_contacto', data.nombre_persona_contacto)
      .set('correo_contacto', data.correo_contacto)
      .set('pbx', data.pbx)
      .set('telefono_persona_contacto', data.telefono_persona_contacto)
      .set('direccion', data.direccion)
      .set('descripcion', data.descripcion)
      .set('tipo_proveedor', data.tipo_proveedor)
      .set('estado', data.estado);

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }

  crearUsuario(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');
  
    const body = new HttpParams()
      .set('usuario', data.usuario)
      .set('contraseña', data.password)
      .set('id_proveedor', data.id.toString())
      .set('id_rol', data.id_rol.toString())
  
    return this.http.post<any>(`${API_URL}usuarios/registrarProveedores`, body.toString(), { headers });
  }  
}
