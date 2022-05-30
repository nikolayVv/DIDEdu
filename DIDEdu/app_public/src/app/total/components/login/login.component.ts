import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarService } from "../../services/navbar.service";
import { FooterService } from "../../services/footer.service";
import { University } from "../../classes/university";
import { Faculty } from "../../classes/faculty";
import { AuthenticationService } from "../../services/authentication.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {environment} from "../../../../environments/environment";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public formError: string = '';
  public formErrorDID: string = '';
  public showSpinner: boolean = false;
  public did: string = '';
  public display = 'none';

  public loginData = {
      id_user: 0,
      email: '',
      name: '',
      password: '',
      role: '',
      hasDid: 0
  }

  public walletCredentials = {
      username: '',
      password: ''
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService
  ) { }

  public chooseDid(): void {
    this.showSpinner = true;
  }

  public sendDataDID(): void {
    this.formError = '';
    let did = this.did.toLowerCase().trim();

    if (!did) {
      this.formError = 'All data is required, please try again!';
    } else if (did.split(":")[0] !== 'did') {
      this.formError = 'Invalid format! The DID should start with "did"!';
    } else if (did.split(":")[2].length !== 64) {
      this.formError = 'Invalid format! The DID Method-Specific Identifier must be exactly 64 chars long!'
    } else {
      this.showSpinner = true;
      this.dideduDataService
        .checkDID(did)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
        this.display = 'block';
      })
    }
  }

  public checkCredential(user: any): void {
    this.formError = '';
    this.display = 'none';
    let did = this.did.toLowerCase().trim();
    let authCredential: any = null;
    let currDid: any = null
    for (let i = 0; i < user.didList.length; i++) {
      if (user.didList[i].did === did) {
        currDid = user.didList[i]
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
        .checkStatus(authCredential.operationId)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
          if (answer.status !== 'Success') {
            this.showSpinner = false;
            switch (answer.status) {
              case "Confirming":
              case "Pending":
                this.formError = `It seems like the your authentication credential is still in status '${answer.status}'! Try again later, when it is added to the blockchain!`
                break;
              case "Rejected":
                this.formError = "Your authentication credential isn't successfully added to the blockchain! Please login with email and password and generate a new authentication credential! For more information, contact our support team!"
                break;
              default:
                this.formError = "The operation id of the credential isn't valid! Please login with email and password and generate a new authentication credential! For more information, contact our support team!"
            }
          } else {
            this.dideduDataService
              .getUserByDID(did)
              .pipe(catchError((error2: HttpErrorResponse) => {
                this.formError = error2.toString();
                return throwError(() => error2);
              })).subscribe((answer2) => {
                this.dideduDataService
                .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
                .pipe(catchError((error3: HttpErrorResponse) => {
                  this.showSpinner = false;
                  this.formError = error3.toString();
                  return throwError(() => error3);
                })).subscribe((answer3) => {
                  this.dideduDataService
                    .verifyCredential(
                      authCredential.credential,
                      authCredential.hash,
                      authCredential.batchId,
                      answer3.user.didList[0].did,
                      answer2.email,
                      answer2.id_user.toString(),
                      did,
                      authCredential.title
                    ).pipe(catchError((error4: HttpErrorResponse) => {
                    this.showSpinner = false;
                    this.formError = error4.toString();
                    return throwError(() => error4);
                  })).subscribe((answer4) => {
                    this.showSpinner = false;
                    if (answer4.message !== 'Valid') {
                        this.formError = 'An error occurred when validating the authentication credential! Please try again later!';
                      } else if (!answer4.token) {
                        this.formError = 'An error occurred when trying to generate the token! Please try again later!';
                      } else {
                        this.authenticationService.setToken(answer4.token);
                        this.router.navigateByUrl('didedu');
                      }
                  });
                });
            });
          }
      });
    }

  }

  public sendData(): void {
      this.formError = '';
      if (!this.loginData.email || !this.loginData.password) {
          this.formError = 'All data is required, please try again!';
      } else {
          this.showSpinner = true;
          this.checkUserData();
      }
  }

  private checkUserData(): void {
      this.authenticationService
        .login(this.loginData)
        .pipe(catchError((error: HttpErrorResponse) => {
            this.showSpinner = false;
            this.formError = error.toString();
            return throwError(() => error);
        })).subscribe(() => {
        this.showSpinner = false;
        this.router.navigateByUrl("didedu");
      });
  }

  public onCloseHandled(): void {
    this.showSpinner = false;
    this.formError = 'You have to login with your digital wallet to be able to login with DID!'
    this.display = 'none';
  }

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {

        this.router.navigateByUrl("didedu");
    } else {
        this.nav.hide();
        this.footer.hide();
    }
  }
}
