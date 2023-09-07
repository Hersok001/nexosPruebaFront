import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Mercancia } from './entities';

@Injectable({
  providedIn: 'root'
})
export class MercanciaService {

  constructor(private http: HttpClient,private router:Router) { }

  
  private urlEndPoint:string = 'http://localhost:8080/nexos';   //url del backend


  getMercancia(): Observable <any> { //observable del json 
    return this.http.get(`${this.urlEndPoint}/mercancia`).pipe(    // return del Json del servidor.         
      map((response:any) => {              
            return response;         
      }),        
    )
  } 

  exportarExcel(): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(`${this.urlEndPoint}/mercancia/exportar_excel`, {
      headers: headers,
      responseType: 'blob',
      observe: 'response',
    });
  }

  eliminarMercancia(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/mercancia/${id}`);
  }

  crearMercancia(mercancia: Mercancia): Observable<any> {
    return this.http.post(`${this.urlEndPoint}/mercancia/`, mercancia);
  }
}
