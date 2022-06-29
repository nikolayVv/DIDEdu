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
import has = Reflect.has;
import {Faculty} from "../classes/faculty";
import {Program} from "../classes/program";
import {Course, CourseDetails} from "../classes/course";
import {ObligationsGroup} from "../classes/obligation";
import {Holder} from "../classes/holder";
import {CredentialPresent} from "../classes/credential";

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

  /* Authentication */
  public login(user: User): Observable<ResultAuthentication> {
    return this.authentication('login', user);
  }

  public registerUniversityController(user: User): Observable<ResultAuthentication> {
    return this.authentication(`universities/controllers`, user);
  }

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
      const url: string = `${this.apiUrl}/universities/filter`;


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

  public getControlledUniversity(idUser: number): Observable<University> {
      const url: string = `${this.apiUrl}/universities/controlledBy/${idUser}`;
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
        }),
      };

      return this.http
        .get<University>(url, httpOptions)
        .pipe(retry(1), catchError(this.handleError));
  }

  /* Faculties */
  public getAllFaculties(): Observable<Faculty[]> {
    const url: string = `${this.apiUrl}/faculties`
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
      }),
    };

    return this.http
      .get<Faculty[]>(url, httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }

  public getFacultiesFiltered(value: string): Observable<Faculty[]> {
    const url: string = `${this.apiUrl}/faculties/filter`;

    return this.http
      .post<Faculty[]>(url, {
        value: value
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  public addFaculty(data: any, programs: Program[]): Observable<any> {
    const url: string = `${this.apiUrl}/faculties`;
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.storage.getItem('didedu-token')}`,
      }),
    };

    return this.http
      .post(url, {
        faculty: data,
        programs: programs
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  /* Courses */
  public getProfessorCourses(idUser: string): Observable<Course[]> {
      const url: string = `${this.apiUrl}/professors/${idUser}/courses`;

      return this.http
        .get<Course[]>(url)
        .pipe(retry(1), catchError(this.handleError));
  }

  public getStudentCourses(idUser: string): Observable<Course[]> {
    const url: string = `${this.apiUrl}/students/${idUser}/courses`;

    return this.http
      .get<Course[]>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public getCourseDetails(idCourse: string): Observable<CourseDetails> {
    const url: string = `${this.apiUrl}/courses/${idCourse}`;

    return this.http
      .get<CourseDetails>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* Obligations */
  public addObligationsGroup(
    title: string,
    idCourse: number,
    type: string
  ): Observable<any> {
    const url: string = `${this.apiUrl}/obligations/${idCourse}/groups`;

    return this.http
      .post(url, {
        title: title,
        type: type
      }).pipe(retry(1), catchError(this.handleError));
  }

  public addObligation(
    idObligationsGroup: number,
    title: string
  ): Observable<any> {
    const url: string = `${this.apiUrl}/obligations/${idObligationsGroup}`;

    return this.http
      .post(url, {
        title: title,
      }).pipe(retry(1), catchError(this.handleError));
  }

  public getObligationsGroupsByCourse(idCourse: string): Observable<ObligationsGroup[]> {
    const url: string = `${this.apiUrl}/obligations/${idCourse}/groups`;

    return this.http
      .get<ObligationsGroup[]>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public changeObligationStatus(idObligation: number, newStatus: string): Observable<any> {
    const url: string = `${this.apiUrl}/obligations/${idObligation}`;

    return this.http
      .put<any>(url, {status: newStatus})
      .pipe(retry(1), catchError(this.handleError));
  }

  /* Users */
  public getUserByDID(did: string): Observable<User> {
      const url: string = `${this.apiUrl}/users/did`;

      return this.http
        .post<User>(url, { did: did })
        .pipe(retry(1), catchError(this.handleError));
  }

  /* DID */
  public checkDID(did: string): Observable<any> {
      const url: string = `${this.didUrl}/checkDid`;

      return this.http
        .post<any>(url, { did: did })
        .pipe(retry(1), catchError(this.handleError));
  }

  public checkStatus(idOperation: string): Observable<any> {
    const url: string = `${this.didUrl}/${idOperation}/status`;

    return this.http
      .get(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public addDID(idUser: string, did: string, title: string): Observable<any> {
      const url: string = `${this.apiUrl}/users/${idUser}/identities`;

      return this.http
        .post(url, { did: did, title: title })
        .pipe(retry(1), catchError(this.handleError));
  }

  public getDIDs(idUser: string, title: string): Observable<Identity[]> {
      const url: string = `${this.apiUrl}/users/${idUser}/identities/filter`;

      return this.http
        .post<Identity[]>(url, { title: title })
        .pipe(retry(1), catchError(this.handleError));
  }

  public deleteDID(idIdentity: string): Observable<any> {
    const url: string = `${this.apiUrl}/identities/${idIdentity}`;

    return this.http
      .delete(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  public getAllDIDs(): Observable<Identity[]> {
    const url: string = `${this.apiUrl}/identities`;

    return this.http
      .get<Identity[]>(url)
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

  public issueBatch(
    username: string,
    mnemonic: string[],
    passphrase: string,
    data: any
  ): Observable<any> {
    const url: string = `${this.didUrl}/issue/batch`;

    return this.http
      .post(url, {
        username: username,
        mnemonic: mnemonic,
        passphrase: passphrase,
        data: data
      }).pipe(retry(1), catchError(this.handleError));
  }

  public issuePresentation(
    title: string,
    subjectTitle: string,
    username: string,
    mnemonic: string[],
    passphrase: string,
    didHolders: string[],
    credentials: CredentialPresent[],
    userEmail: string,
    userId: string,
    adminDid: string,
    role: string = ''
  ): Observable<any> {
    const url: string = `${this.didUrl}/issue/presentation`;

    return this.http
      .post(url, {
        title: title,
        subjectTitle: subjectTitle,
        username: username,
        mnemonic: mnemonic,
        passphrase: passphrase,
        didHolders: didHolders,
        credentials: credentials,
        userEmail: userEmail,
        userId: userId,
        adminDid: adminDid,
        role: role
      }).pipe(retry(1), catchError(this.handleError));
  }

  public verifyCredential(
    credential: string,
    batchId: string,
    issuerDid: string,
    userEmail: string,
    userId: string,
    holderDid: string,
    credentialName: string,
    role: string = ''
  ): Observable<any> {
      const url: string = `${this.didUrl}/verify/credential`;

      return this.http
        .post(url, {
            credential: credential,
            batchId: batchId,
            issuerDid: issuerDid,
            userEmail: userEmail,
            userId: userId,
            holderDid: holderDid,
            credentialName: credentialName,
            role: role
        }).pipe(retry(1), catchError(this.handleError));
  }

  public revokeCredential(
    credential: string,
    username: string,
    mnemonic: string[],
    passphrase: string,
    holderDid: string,
    hash: string,
    batchId: string
  ): Observable<any> {
    const url: string = `${this.didUrl}/revoke/credential`;

    return this.http
      .post(url, {
        credential: credential,
        username: username,
        mnemonic: mnemonic,
        passphrase: passphrase,
        holderDid: holderDid,
        hash: hash,
        batchId: batchId
      }).pipe(retry(1), catchError(this.handleError));
  }

  public getVerifiedUsers(users: any, issuerDid: string, credentialName: string): Observable<any> {
    const url: string = `${this.didUrl}/verify/credential/returnValid`;

    return this.http
      .post(url, {
        users: users,
        issuerDid: issuerDid,
        credentialName: credentialName
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

  public checkIfAlreadyIssued(holders: User[], name: string, enrollmentName: string): Observable<User[]> {
    const url: string = `${this.walletUrl}/did/vc/check`;

    return this.http
      .post<User[]>(url, { users: holders, name: name, enrollmentName: enrollmentName })
      .pipe(retry(1), catchError(this.handleError));
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
