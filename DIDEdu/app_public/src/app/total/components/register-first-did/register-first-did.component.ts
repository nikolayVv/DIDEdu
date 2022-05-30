import {Component, Input, OnInit, Output} from '@angular/core';
import {User} from "../../classes/user";
import {DideduDataService} from "../../services/didedu-data.service";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-register-first-did',
  templateUrl: './register-first-did.component.html',
  styleUrls: ['./register-first-did.component.css']
})
export class RegisterFirstDidComponent implements OnInit {
  @Input() user: User | undefined | null;

  public formError: string = '';
  public formSuccess: string = '';
  public showSpinner: boolean = false;
  public did: string = '';
  private thread: any;
  private currStatus: string = 'Pending';

  constructor(
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  public sendData(): void {
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
      this.issueCredential(did);
    }
  }

  private issueCredential(did: string) {
    this.dideduDataService
      .checkDID(did)
      .pipe(catchError((error1: HttpErrorResponse) => {
        this.showSpinner = false;
        this.formError = error1.toString();
        return throwError(() => error1);
      })).subscribe((answer1) => {
      this.dideduDataService
        .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
        .pipe(catchError((error3: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error3.toString();
          return throwError(() => error3);
        })).subscribe((answer3) => {
        let credential = [
          {
            key: "credentialName",
            value: environment.AUTH_CREDENTIAL_NAME,
          },
          {
            key: "userEmail",
            value: this.user?.email
          },
          {
            key: "userId",
            value: this.user?.id_user
          },
          {
            key: "didedu-token",
            value: this.authenticationService.getToken()
          }
        ]
        if (answer3.user) {
          this.dideduDataService
            .issueCredential(
              answer3.user.username,
              answer3.user.mnemonic,
              environment.AUTH_CREDENTIAL_PASSPHRASE,
              did,
              credential
            ).pipe(catchError((error4: HttpErrorResponse) => {
            this.showSpinner = false;
            this.formError = error4.toString();
            return throwError(() => error4);
          })).subscribe((answer4) => {
            //Add in the user's acc
            this.dideduDataService
              .addCredentialToAcc(
                did,
                environment.AUTH_CREDENTIAL_NAME,
                answer4.credential,
                answer4.operationId,
                answer4.hash,
                answer4.batchId,
                answer4.curve,
                answer4.data,
                answer4.unknownFields ? answer4.unknownFields : {}
              ).pipe(catchError((error5: HttpErrorResponse) => {
                this.showSpinner = false;
                this.formError = error5.toString();
                return throwError(() => error5);
              })).subscribe((answer5) => {
                this.dideduDataService
                  .addDID(this.user!!.id_user.toString(), did)
                  .pipe(catchError((error6: HttpErrorResponse) => {
                    this.showSpinner = false;
                    this.formError = error6.toString();
                    return throwError(() => error6);
                  })).subscribe((answer6) => {
                    this.thread = setInterval(() => this.checkStatus(answer4.operationId, did, answer5._id, answer4.hash), 7000);
                    this.showSpinner = false;
                    this.formSuccess = 'A credential was issued to your wallet! You will be redirected to the login page in 5 seconds!';
                    setTimeout(() => {
                      this.authenticationService.logout();
                      this.router.navigateByUrl('login')
                    }, 5000);
                  });
            });
          });
        } else {
          this.showSpinner = false;
          this.formError = 'There was an error sending the credential! Please try again with another DID!';
        }
      });
    });
  }

  private checkStatus = (operationId: string, did: string, idUser: string, credentialHash: string) => {
      this.dideduDataService
        .checkStatus(operationId)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
            if (this.currStatus !== answer.status) {
              this.currStatus = answer.status;
              this.dideduDataService
                .updateStatusVC(idUser, did, credentialHash, answer.status)
                .pipe(catchError((error2: HttpErrorResponse) => {
                  this.formError = error2.toString();
                  return throwError(() => error2);
                })).subscribe((answer2) => {
                if (answer.status === 'Success' || answer.status === 'Rejected' || answer.status === 'Unknown operation') {
                  clearInterval(this.thread);
                }
              });
            }
        })
  };

  ngOnInit(): void {

  }

}


// let operationId = ''
// for (let i = 0; i < answer3.didList.length; i++) {
//   if (answer3.didList[i].did === did) {
//     operationId = answer3.didList[i].operationId;
//     break;
//   }
// }
// if (!operationId) {
//   this.showSpinner = false;
//   this.formError = "Couldn't find the operation id of the website";
// } else {
//
// }
