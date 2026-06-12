import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../constants/api_url';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private allUrl = `${API_URL}compras/all`;
  private createUrl = `${API_URL}compras/register`;
  private cancelUrl = `${API_URL}compras/cancel`;
  private resourceUrl = `${API_URL}recursos/todosestado`;
  private providerUrl = `${API_URL}proveedores/todosestado`;

  constructor(private http: HttpClient) {}

  getCompra(estado: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new HttpParams().set('estado', estado);
    
    return this.http.post<any>(this.allUrl, body.toString(), { headers });
  }

  createCompra(data: any): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  
    return this.http.post<any>(this.createUrl, data, { headers });
  }

  cancelCompra(id: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.cancelUrl}/${id}`, { headers });
  }

  getRecurso(estado: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
      
    // Cambiar a GET y usar query parameters
    const params = new HttpParams().set('estado', estado);
    
    return this.http.get<any>(this.resourceUrl, { headers, params });
  }

  getProveedor(estado: string): Observable<any> {
    const token = localStorage.getItem('angular17token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
      
    // Usar parámetros de consulta
    const params = new HttpParams().set('estado', estado);
    
    return this.http.get<any>(this.providerUrl, { headers, params });
  }

  getCompraById(compraId: number): Observable<any> {
    const token = localStorage.getItem('angular17token');
    if (!token) {
      throw new Error('Token not found');
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    const url = `${API_URL}compras/${compraId}`; 
    return this.http.get<any>(url, { headers });
  }
}