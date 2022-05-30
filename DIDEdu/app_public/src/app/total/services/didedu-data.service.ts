import {Inject, Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { University } from "../classes/university";
import { User } from "../classes/user";
import { ResultAuthentication } from "../classes/result-authentication";
import { BROWSER_STORAGE } from "../classes/storage";
import { environment } from "../../../environments/environment";
import {Identity} from "../classes/identity";

@Injectable({
  providedIn: 'root'
})
export class DideduDataService {

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  private apiUrl = environment.apiUrl;
  private didUrl = environment.didUrl;
  private walletUrl = environment.walletUrl;

  /* Universities */
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
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
        }),
      };

      return this.http
        .post(url, data)
        .pipe(retry(1), catchError(this.handleError));
  }

  public getUniversitiesFiltered(filter: string, value: string): Observable<University[]> {
      const url: string = `${this.apiUrl}/universities/filter?type=${filter}`;


      return this.http
        .post<University[]>(url, {
            type: filter,
            value: value
        })
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

  /* Authentication */
  public login(user: User): Observable<ResultAuthentication> {
      return this.authentication('login', user);
  }

  public registerUniversityController(user: User): Observable<ResultAuthentication> {
      return this.authentication(`universities/controllers`, user);
  }

  /* DID */
  public checkDID(did: string): Observable<any> {
      const url: string = `${this.didUrl}/checkDid`;

      return this.http
        .post<any>(url, { did: did })
        .pipe(retry(1), catchError(this.handleError));
  }

  public addDID(idUser: string, did: string): Observable<any> {
      const url: string = `${this.apiUrl}/users/${idUser}/identities`;

      return this.http
        .post(url, { did: did })
        .pipe(retry(1), catchError(this.handleError));
  }

  public getDIDs(idUser: string): Observable<Identity[]> {
      const url: string = `${this.apiUrl}/users/${idUser}/identities`;

      return this.http
        .get<Identity[]>(url)
        .pipe(retry(1), catchError(this.handleError));
  }

  public checkStatus(idOperation: string): Observable<any> {
      const url: string = `${this.didUrl}/${idOperation}/status`;

      return this.http
        .get(url)
        .pipe(retry(1), catchError(this.handleError));
  }


  public issueCredential(
    username: string,
    mnemonic: string[],
    passphrase: string,
    didHolder: string,
    data: any[]
  ): Observable<any> {
      const url: string = `${this.didUrl}/issue/credential`;

      return this.http
        .post(url, {
          username: username,
          mnemonic: mnemonic,
          passphrase: passphrase,
          didHolder: didHolder,
          data: data
        }).pipe(retry(1), catchError(this.handleError));
  }

  /* Wallet */
  public getWalletAcc(username: string, password: string): Observable<any> {
      const url: string = `${this.walletUrl}/login`;

      return this.http
        .post(url, {
          username: username,
          password: password
        })
        .pipe(retry(1), catchError(this.handleError));
  }

  public addCredentialToAcc(
    did: string,
    title: string,
    credential: string,
    operationId: string,
    hash: string,
    batchId: string
  ): Observable<any> {
      const url: string = `${this.walletUrl}/did/vc`;

      return this.http
        .put(url, {
          did: did,
          credentialData: {
            title,
            credential,
            operationId,
            hash,
            batchId
          }
        }).pipe(retry(1), catchError(this.handleError));
  }

  public updateStatusVC(
    idUser:string,
    did: string,
    credentialHash: string,
    status: string
  ): Observable<any> {
      const url: string = `${this.walletUrl}/users/${idUser}/did/vc`;

      return this.http
        .put(url, {
            did: did,
            hash: credentialHash,
            status: status
        }).pipe(retry(1), catchError(this.handleError));
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
