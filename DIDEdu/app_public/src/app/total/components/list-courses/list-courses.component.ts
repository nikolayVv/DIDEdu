import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../classes/user";
import {DideduDataService} from "../../services/didedu-data.service";
import {catchError, switchMap} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {Course, CourseDetails} from "../../classes/course";
import {environment} from "../../../../environments/environment";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Identity} from "../../classes/identity";
import {AuthenticationService} from "../../services/authentication.service";
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {CredentialPresent} from "../../classes/credential";

@Component({
  selector: 'app-list-courses',
  templateUrl: './list-courses.component.html',
  styleUrls: ['./list-courses.component.css']
})
export class ListCoursesComponent implements OnInit {
  @Input() user: User | undefined | null;

  public formError = '';
  public errorMessage = '';
  public courses: Course[] = [];
  public displayLogin: string = 'none';
  public display: string = 'none';
  public showSpinner: boolean = false;
  public currUser: User | null = null;
  public currDid: Identity | null = null;
  public type: string = '';
  public currCourse: CourseDetails | null = null;
  public currCredentials: CredentialPresent[] = [];

  constructor(
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private nav: NavbarService,
    private footer: FooterService,
    private path: ActivatedRoute
  ) { }

  private getCourses() {
    if (this.user?.role === 'professor') {
      this.dideduDataService
        .getProfessorCourses(this.user!!.id_user.toString())
        .pipe(catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.toString();
          this.courses = [];
          return throwError(() => error);
        })).subscribe((foundCourses) => (this.courses = foundCourses))
    } else if (this.user?.role === 'student') {
      this.dideduDataService
        .getStudentCourses(this.user!!.id_user.toString())
        .pipe(catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.toString();
          this.courses = [];
          return throwError(() => error);
        })).subscribe((foundCourses) => (this.courses = foundCourses))
    } else {
      this.errorMessage = 'Only professors and students are allowed to see the courses';
      this.courses = [];
    }
  }

  public enroll(isRequired: boolean, idCourse: number): void {
    if (isRequired) {
      this.dideduDataService
        .getCourseDetails(idCourse.toString())
        .subscribe((foundCourse) => {
          this.currCourse = foundCourse;
          this.displayLogin = 'block';
          this.showSpinner = true;
        });
    } else {

    }
  }

  public showPresentations(user: any): void {
    this.onCloseHandled();
    this.showSpinner = true;
    this.formError = '';
    let authCredential: any = null;
    let currDid: any = null
    for (let i = 0; i < user.didList.length; i++) {
      if (user.didList[i].did === this.currDid?.did) {
        currDid = user.didList[i];
        for (let j = 0; j < currDid.credentialsList.length; j++) {
          if (currDid.credentialsList[j].title === environment.AUTH_CREDENTIAL_NAME) {
            authCredential = currDid.credentialsList[j];
            break;
          }
        }
        break;
      }
    }
    if (!currDid) {
      this.showSpinner = false;
      this.formError = "Couldn't find the chosen DID in your digital wallet! Check your digital wallet and the DID for any misspelled characters!";
    } else if (!authCredential) {
      this.showSpinner = false;
      this.formError = "Couldn't find our authentication credential, issued to the chosen DID! Check your wallet again or get authentication credential by logging in with email and password!";
    } else {
      this.dideduDataService
        .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((accDIDEdu) => {
        this.dideduDataService
          .verifyCredential(
            authCredential.credential,
            authCredential.batchId,
            accDIDEdu.user.didList[0].did,
            this.currUser?.email!!,
            this.currUser!!.id_user!!.toString(),
            currDid.did,
            environment.AUTH_CREDENTIAL_NAME,
            this.currUser?.role
          ).pipe(catchError((error: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
          if (answer.message !== 'Valid') {
            this.showSpinner = false;
            this.formError = 'An error occurred when validating the enrollment credential! Please try again later!';
          } else {
            user.didList.forEach((did: any) => {
              did.credentialsList.forEach((credential: any) => {
                if (credential.title.includes("Presentation")) {
                  this.currCredentials.push({
                    title: credential.title,
                    did: did.did,
                    credential: credential.credential,
                    batchId: credential.batchId,
                    chosenAttributes: []
                  });
                }
              });
            });

            this.type = 'verifyPresentation';
            this.display = 'block';
          }
        });
      });
    }
  }

  public verifyCredentialEvent() {

  }

  public onCloseHandled(): void {
    this.displayLogin = 'none';
    this.showSpinner = false;
    this.display = 'none';
  }

  public delete(idCourse: string): void {

  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.currUser = this.authenticationService.getCurrentUser();
      this.dideduDataService
        .getDIDs(this.currUser!!.id_user.toString(), "Auth")
        .subscribe((dids) => {
          if (dids.length > 0) {
            this.nav.show();
            this.footer.show();
            this.currDid = dids[0];
            this.getCourses();
          } else {
            this.router.navigateByUrl('didedu')
          }
        })
    }
  }

}
