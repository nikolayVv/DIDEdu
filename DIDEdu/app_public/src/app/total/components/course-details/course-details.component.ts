import { Component, OnInit } from '@angular/core';
import {CourseDetails} from "../../classes/course";
import {catchError, switchMap} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {User} from "../../classes/user";
import {NavbarComponent} from "../navbar/navbar.component";
import {FooterComponent} from "../footer/footer.component";
import {FooterService} from "../../services/footer.service";
import {NavbarService} from "../../services/navbar.service";
import {University} from "../../classes/university";
import {Identity} from "../../classes/identity";
import {Obligation, ObligationsGroup} from "../../classes/obligation";
import {environment} from "../../../../environments/environment";
import {Thread} from "../../classes/thread";
import {Task} from "@angular/compiler-cli/ngcc/src/execution/tasks/api";
import {CredentialPresent} from "../../classes/credential";

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  public currCourse: CourseDetails | null = null;
  public showSpinner: boolean = true;
  public currGroup: ObligationsGroup | null = null;
  public currObligation: Obligation | null = null;
  public currUser: User | null = null;
  public display = 'none';
  public displayLogin = 'none';
  public dids: Identity[] = [];
  public obligationsGroups: ObligationsGroup[] = [];
  public type: string = 'enroll';
  public formError: string = '';
  public filteredStudents: User[] = [];
  public currMnemonic: string[] = [];
  public currUsername: string = '';
  public currPassphrase: string = '';
  public currCredentials: CredentialPresent[] = [];

  constructor(
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private nav: NavbarService,
    private footer: FooterService,
    private path: ActivatedRoute
  ) { }

  public issueCredentialEvent(): void {
    this.onCloseHandled();
    this.ngOnInit();
  }

  public checkCourseCredential(user: any): void {
    this.displayLogin = 'none';
    this.showSpinner = true;
    let enrollmentCredential: any = null;
    let currDid: any = null
    this.dideduDataService
      .getDIDs(this.currUser!!.id_user!!.toString(), this.currCourse?.title!!)
      .subscribe((foundDids) => {
        for (let i = 0; i < user.didList.length; i++) {
            if (user.didList[i].did === foundDids[0].did) {
              currDid = user.didList[i]
              for (let j = 0; j < currDid.credentialsList.length; j++) {
                if (currDid.credentialsList[j].title === `${this.currCourse?.title} (Enrollment)`) {
                  enrollmentCredential = currDid.credentialsList[j];
                  break;
                }
              }
              break;
            }
        }
        if (!currDid) {
          this.showSpinner = false;
          this.formError = "Couldn't find any DID from the database in your wallet!";
        } else if (!enrollmentCredential) {
          this.showSpinner = false;
          this.formError = "Couldn't find the enrollment credential, issued to any of your DIDs! Check your wallet again or get enrollment credential for this course!";
        }
        this.currPassphrase = currDid.title;

        this.dideduDataService
          .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
          .pipe(catchError((error: HttpErrorResponse) => {
            this.showSpinner = false;
            this.formError = error.toString();
            return throwError(() => error);
          })).subscribe((accDIDEdu) => {
            this.dideduDataService
              .verifyCredential(
                enrollmentCredential.credential,
                enrollmentCredential.batchId,
                accDIDEdu.user.didList[0].did,
                this.currUser?.email!!,
                this.currUser!!.id_user!!.toString(),
                currDid.did,
                this.currCourse?.title + " (Enrollment)",
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
                this.currMnemonic = user.mnemonic;
                this.currUsername = user.username;
                if (this.type === 'presentation') {
                  user.didList.forEach((did: any) => {
                    did.credentialsList.forEach((credential: any) => {
                      this.currCredentials.push({
                        title: credential.title,
                        did: did.did,
                        credential: credential.credential,
                        batchId: credential.batchId
                      });
                    });
                  });
                }
                this.openForm(this.type, this.currGroup);
              }
          });
        })

      });

  }


  public openLogin(type: string, obligation: Obligation | null, obligationsGroup: ObligationsGroup | null): void {
    this.currGroup = obligationsGroup;
    this.formError = '';
    this.type = type;
    this.currObligation = obligation;
    this.showSpinner = true;
    this.displayLogin = 'block';
  }

  private issueExamCredential(name: string): void {

  }

  private issueObligationCredential(name: string): void {

  }

  public onCloseHandled(): void {
    this.showSpinner = false;
    this.display = 'none';
    this.displayLogin = 'none';
  }

  public openForm(type: string, obligationsGroup: ObligationsGroup | null = null): void {
    this.showSpinner = true;
    this.formError = '';
    this.currGroup = obligationsGroup;
    this.type = type;
    this.display = 'block';
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
            this.path.paramMap
              .pipe(
                switchMap((params: ParamMap) => {
                  let idCourse: string = (params.get('idCourse') || '').toString();
                  return this.dideduDataService.getCourseDetails(idCourse);
                })
              )
              .subscribe((course: CourseDetails) => {
                this.dideduDataService
                  .getDIDs(this.currUser!!.id_user.toString(), course.title)
                  .subscribe((courseDids: Identity[]) => {
                    this.dideduDataService
                      .getObligationsGroupsByCourse(course.id_course.toString())
                      .subscribe((foundObligationsGroups) => {
                        this.dids = courseDids;
                        this.currCourse = course;
                        this.obligationsGroups = foundObligationsGroups;

                        if (courseDids.length > 0) {
                          this.showSpinner = false;
                        } else {
                          this.display = 'block';
                        }
                      });
                    });
              });
          } else {
            this.router.navigateByUrl('didedu')
          }
        })
    }
  }

}
