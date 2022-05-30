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

  public loginData = {
      id_user: 0,
      email: '',
      name: '',
      password: '',
      role: '',
      hasDid: 0
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
        .pipe(catchError((error1: HttpErrorResponse) => {
          this.showSpinner = false;
          this.formError = error1.toString();
          return throwError(() => error1);
        })).subscribe((answer1) => {
        this.showSpinner = false;
        console.log(answer1);
      })
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

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {
        this.router.navigateByUrl("didedu");
    } else {
        this.nav.hide();
        this.footer.hide();
    }
  }
}
