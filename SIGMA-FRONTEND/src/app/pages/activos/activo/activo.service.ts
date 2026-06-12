import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';
import { URLFOTOS } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class ActivoService {
  private allUrl = `${API_URL}activos/todos`;
  private createUrl = `${API_URL}activos/crear`;
  private updateUrl = `${API_URL}activos/editar`;
  private changeUrl = `${API_URL}activos/cambiar`;
  private allUrlUbicaciones = `${API_URL}activos/ubicaciones`;
  private qrsUrl = `${API_URL}qr`;
  private storageUrl = `${URLFOTOS}storage`;

  constructor(private http: HttpClient) { }

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
    return this.http.get<any>(this.allUrl, { headers }).pipe();
  }

  cambiarEstado(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.changeUrl}/${id}`, { headers }).pipe();
  }

  crearActivo(data: any): Observable<any> {
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
      .set('codigo', data.codigo)
      .set('descripcion', data.descripcion)
      .set('precio', data.precio)
      .set('fecha_adquisicion', data.fecha_adquisicion)
      .set('id_instalacion', data.id_instalacion)
      .set('generarQR', data.generarQR); // Nuevo campo para la opción de generar QR

    return this.http.post<any>(this.createUrl, body.toString(), { headers });
  }

   // Método para obtener el QR de un activo
   getQRCode(activoId: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    
    return this.http.get<any>(`${this.qrsUrl}/${activoId}`, { headers });
  }

  actualizarActivo(id: number, data: any): Observable<any> {
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
      .set('codigo', data.codigo) // Nuevo campo para el código del activo
      .set('descripcion', data.descripcion)
      .set('precio', data.precio)
      .set('fecha_adquisicion', data.fecha_adquisicion)
      .set('id_instalacion', data.id_instalacion)
      .set('generarQR', data.generarQR); // Nuevo campo para la opción de generar QR

    return this.http.post<any>(`${this.updateUrl}/${id}`, body.toString(), { headers });
  }

}
