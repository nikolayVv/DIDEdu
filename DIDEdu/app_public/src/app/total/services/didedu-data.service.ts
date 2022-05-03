import {Inject, Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { University } from "../classes/university";
import { User } from "../classes/user";
import { ResultAuthentication } from "../classes/result-authentication";
import { BROWSER_STORAGE } from "../classes/storage";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DideduDataService {

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  private apiUrl = environment.apiUrl;

  public getAllUniversities(): Observable<University[]> {
      const url: string = `${this.apiUrl}/universities`
      const httpOptions = {
          headers: new HttpHeaders({
              Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
          }),
      };
      return this.http
        .get<University[]>(url, httpOptions)
        .pipe(retry(1), catchError(this.handleError));
  }

  public login(user: User): Observable<ResultAuthentication> {
      return this.authentication('login', user);
  }

  public register(user: User): Observable<ResultAuthentication> {
      return this.authentication('register', user);
  }

  private authentication(urlAddress: string, user: User): Observable<ResultAuthentication> {
      const url: string = `${this.apiUrl}/${urlAddress}`;
      return this.http
        .post<ResultAuthentication>(url, user)
        .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}
