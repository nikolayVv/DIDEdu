import {Component, Input, OnInit} from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {catchError, switchMap} from "rxjs/operators";
import {University} from "../../classes/university";
import {User} from "../../classes/user";
import {Identity} from "../../classes/identity";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {environment} from "../../../../environments/environment";
import {Thread} from "../../classes/thread";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  public currUser: User | null = null;
  public dids: Identity[] = [];
  public showSpinner: boolean = true;
  public formError = '';
  public formSuccess = '';
  public formErrorDID: string = '';
  private chosenDID = '';
  private statusThreadArray: Thread[] = [];
  private idIdentity = '';

  public display = 'none';
  public walletCredentials = {
    username: '',
    password: ''
  }

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private path: ActivatedRoute
  ) { }

  public revoke(did: string, idIdentity: number) {
    this.idIdentity = idIdentity.toString();
    this.chosenDID = did;
    this.showSpinner = true;
    this.display = 'block';
  }

  public checkCredential(user: any) {
    this.formError = '';
    this.display = 'none';
    let authCredential: any = null;
    let currDid: any = null
    for (let i = 0; i < user.didList.length; i++) {
      if (user.didList[i].did === this.chosenDID) {
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
      this.formError = "Couldn't find the chosen DID in your digital wallet! Check your digital wallet and make sure you have it!";
    } else if (!authCredential) {
      this.showSpinner = false;
      this.formError = "Couldn't find our authentication credential, issued to the chosen DID! Check the DID in your wallet again and make sure you have the authentication credential!";
    } else {
        this.dideduDataService
          .checkStatus(authCredential.operationId)
          .pipe(catchError((error: HttpErrorResponse) => {
            this.showSpinner = false;
            this.formError = error.toString();
            return throwError(() => error);
          })).subscribe((answer) => {
              if (answer.status !== 'Success' && answer.status !== 'Rejected') {
                this.showSpinner = false;
                switch (answer.status) {
                  case "Confirming":
                  case "Pending":
                    this.formError = `It seems like the your authentication credential is still in status '${answer.status}'! Try again later, when it is added to the blockchain!`
                    break;
                  default:
                    this.formError = "The operation id of the credential isn't valid! Please login with email and password and generate a new authentication credential! For more information, contact our support team!"
                }
              } else {
                this.dideduDataService
                  .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
                  .pipe(catchError((error2: HttpErrorResponse) => {
                    this.showSpinner = false;
                    this.formError = error2.toString();
                    return throwError(() => error2);
                  })).subscribe((answer2) => {
                    this.dideduDataService
                      .revokeCredential(
                        authCredential.credential,
                        answer2.user.username,
                        answer2.user.mnemonic,
                        environment.AUTH_CREDENTIAL_PASSPHRASE,
                        currDid.did,
                        authCredential.hash,
                        authCredential.batchId
                      )
                      .pipe(catchError((error3: HttpErrorResponse) => {
                        this.showSpinner = false;
                        this.formError = error3.toString();
                        return throwError(() => error3);
                      })).subscribe((answer3) => {
                          //Add in the user's acc
                          //TODO -> remove from mysql
                          let newThread = new Thread()
                          newThread.currThread = setInterval(() => this.checkStatus(answer3.operationId, currDid.did, user._id, authCredential.hash), 7000),
                          newThread.currStatus = '';
                          newThread.did = currDid.did;
                          this.statusThreadArray.push(newThread);
                          this.dideduDataService
                            .deleteDID(this.idIdentity)
                            .pipe(catchError((error4: HttpErrorResponse) => {
                              this.showSpinner = false;
                              this.formError = error4.toString();
                              return throwError(() => error4);
                            })).subscribe((answer4) => {
                              this.showSpinner = false;
                              this.formSuccess = 'The authentication credential was successfully revoked and removed from your account!';
                              for (let i = 0; i < this.dids.length; i++) {
                                if (this.dids[i].did === currDid.did) {
                                  this.dids.splice(i, 1);
                                  break;
                                }
                              }
                          });
                      });
                });
              }
        });
    }
  }

  private checkStatus = (operationId: string, did: string, idUser: string, credentialHash: string) => {
    let currThread: Thread | null = null;
    let currIndex = -1;
    for (let i = 0; i < this.statusThreadArray.length; i++) {
      if (this.statusThreadArray[i].did === did) {
        currThread = this.statusThreadArray[i];
        currIndex = i;
        break;
      }
    }
    this.dideduDataService
      .checkStatus(operationId)
      .pipe(catchError((error: HttpErrorResponse) => {
        this.formError = error.toString();
        return throwError(() => error);
      })).subscribe((answer) => {
      if (currThread?.currStatus !== answer.status) {
        this.statusThreadArray[currIndex].currStatus = answer.status;
        switch (answer.status) {
          case "Success":
              answer.status = 'Revoked';
            break;
          default:
              answer.status = answer.status + ' (Revocation)'
        }
        this.dideduDataService
          .updateStatusVC(idUser, did, credentialHash, answer.status)
          .pipe(catchError((error2: HttpErrorResponse) => {
            this.formError = error2.toString();
            return throwError(() => error2);
          })).subscribe((answer2) => {
          if (currThread!!.currStatus === 'Success' || currThread!!.currStatus === 'Rejected' || currThread!!.currStatus === 'Unknown operation') {
            this.statusThreadArray.splice(currIndex, 1);
            clearInterval(currThread!!.currThread);
          }
        });
      }
    })
  };

  public onCloseHandled(): void {
    this.showSpinner = false;
    this.formError = 'You have to login with your digital wallet to be able to revoke your authentication credential!'
    this.display = 'none';
  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.currUser = this.authenticationService.getCurrentUser();
      this.dideduDataService
        .getDIDs(this.currUser!!.id_user.toString(), "All")
        .subscribe((dids) => {
          let isValid = false;
          for (let i = 0; i < dids.length; i++) {
            if (dids[i].title === "Auth") {
              isValid = true;
            }
          }
          if (dids.length > 0 && isValid) {
            this.showSpinner = false;
            this.dids = dids;
            this.nav.show();
            this.footer.show();
          } else {
            this.router.navigateByUrl('didedu')
          }
        })
    }
  }

}
