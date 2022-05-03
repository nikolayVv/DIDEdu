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

  public addUniversity(data: any): Observable<any> {
      const url: string = `${this.apiUrl}/universities`;
      return this.http
        .post(url, data)
        .pipe(retry(1), catchError(this.handleError));
  }

  public getUniversityDetails(idUniversity: string): Observable<University> {
      const url: string = `${this.apiUrl}/universities/${idUniversity}`;
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
        }),
      };
      return this.http
        .get<University>(url, httpOptions)
        .pipe(retry(1), catchError(this.handleError));
  }

  public login(user: User): Observable<ResultAuthentication> {
      return this.authentication('login', user);
  }

  public registerUniversityController(idUniversity: string, user: User): Observable<ResultAuthentication> {
      return this.authentication(`universities/${idUniversity}/controller`, user);
  }

  private authentication(urlAddress: string, user: User): Observable<ResultAuthentication> {
      const url: string = `${this.apiUrl}/${urlAddress}`;
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
        }),
      };
      return this.http
        .post<ResultAuthentication>(url, user, httpOptions)
        .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}
