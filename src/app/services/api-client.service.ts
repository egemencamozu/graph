/* import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API_BASE_URL = 'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {

private readonly baseUrl = API_BASE_URL;

constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return firstValueFrom(
      this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
        catchError(this.handleError)
      )
    );
  }

  post<T>(endpoint: string, body: any = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return firstValueFrom(
      this.http.post<T>(url, body, { headers: this.getHeaders() }).pipe(
        catchError(this.handleError)
      )
    );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
  console.error('API Hatası:', error);
  return throwError(() => new Error(error.message || 'API error'));
}
}
 */
