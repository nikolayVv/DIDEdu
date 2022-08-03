import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {Credential, CredentialPresent} from "../../classes/credential";
import {User} from "../../classes/user";
import {environment} from "../../../../environments/environment";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";

@Component({
  selector: 'app-list-credentials',
  templateUrl: './list-credentials.component.html',
  styleUrls: ['./list-credentials.component.css']
})
export class ListCredentialsComponent implements OnInit {
  public showSpinner: boolean = true;
  public displayLogin: string = 'block';
  public display: string = 'none';
  public credentials: CredentialPresent[] = [];
  public currUser: User | null = null;
  public formError: string = '';
  public currMnemonic: string[] = [];
  public currUsername: string = '';
  public currPassphrase: string = '';
  public courseTitle: string = '';
  public credentialDetails: Credential[] = [];
  public studentDid: string = '';

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  public showCredentials(user: any) {
    this.formError = '';
    this.displayLogin = 'none';
    this.showSpinner = true;

    let authCredential: any = null;
    let currDid: any = null
    for (let i = 0; i < user.didList.length; i++) {
        for (let j = 0; j < user.didList[i].credentialsList.length; j++) {
          if (user.didList[i].credentialsList[j].title === environment.AUTH_CREDENTIAL_NAME) {
            currDid = user.didList[i]
            authCredential = currDid.credentialsList[j];
            break;
          }
        }
        break;
    }

    if (!currDid) {
      this.showSpinner = false;
      this.formError = "Couldn't find any DID from the database in your wallet!";
    } else if (!authCredential) {
      this.showSpinner = false;
      this.formError = "Couldn't find the authentication credential, issued to any of your DIDs! Check your wallet again or get enrollment credential for this course!";
    }

    this.dideduDataService
      .getUserByDID(currDid.did)
      .pipe(catchError((error: HttpErrorResponse) => {
        this.showSpinner = false;
        this.formError = error.toString();
        return throwError(() => error);
      })).subscribe((answer) => {
        if (answer.id_user !== this.currUser?.id_user || answer.email !== this.currUser.email) {
          this.showSpinner = false;
          this.formError = "The DID in your wallet doesn't match the DID in the database!";
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
              ).pipe(catchError((error2: HttpErrorResponse) => {
              this.showSpinner = false;
              this.formError = error2.toString();
              return throwError(() => error2);
            })).subscribe((answer2) => {
              if (answer2.message !== 'Valid') {
                this.showSpinner = false;
                this.formError = 'An error occurred when validating the authentication credential! Please try again later!';
              } else {
                user.didList.forEach((did: any) => {
                  did.credentialsList.forEach((credential: any) => {
                    if (this.currUser?.role === 'professor') {
                      if (credential.title.includes("Presentation")) {
                        this.credentials.push({
                          title: credential.title,
                          did: did.did,
                          credential: credential.credential,
                          batchId: credential.batchId,
                          chosenAttributes: []
                        });
                      }
                    } else if (this.currUser?.role === 'student') {
                      if (!credential.title.includes("Auth") && !credential.title.includes("Enrollment")) {
                        this.credentials.push({
                          title: credential.title,
                          did: did.did,
                          credential: credential.credential,
                          batchId: credential.batchId,
                          chosenAttributes: []
                        });
                      }
                    }
                  });
                });
                this.currMnemonic = user.mnemonic;
                this.currUsername = user.username;
                this.currPassphrase = currDid.title;

                this.onCloseHandled();
              }
            });
          });
        }
    });
  }

  public openForm(credential: CredentialPresent) {
    let idUser = Number(credential.title.split("(")[1].split(")")[0]);

    this.dideduDataService
      .getAllDIDs()
      .subscribe((answer) => {
        let identities = answer.filter((identity) => identity.user === idUser)

        this.dideduDataService
          .showCredential(credential)
          .pipe(catchError((error2: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error2.toString();
          return throwError(() => error2);
        })).subscribe((answer2) => {
          this.credentialDetails = answer2.credential;
          this.display = 'block';
          this.showSpinner = true;
        });
    });
  }

  public verifyCredentialEvent() {

  }

  public onCloseHandled() {
    this.showSpinner = false;
    this.display = 'none';
    this.displayLogin = 'none';
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
          };
      });
    }
  }

}
