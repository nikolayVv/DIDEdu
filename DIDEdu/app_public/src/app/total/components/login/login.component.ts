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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() faculty: Faculty | undefined;
  @Input() university: University | undefined;
  public formError: string = '';

  public loginData = {
      email: '',
      name: '',
      password: '',
      role: ''
  }

  public sendData(): void {
      console.log(this.loginData)
      this.formError = '';
      if (!this.loginData.email || !this.loginData.password) {
          this.formError = 'All data is required, please try again!';
      } else {
          this.checkUserData();
      }
  }

  private checkUserData(): void {
      this.authenticationService
        .login(this.loginData)
        .pipe(catchError((error: HttpErrorResponse) => {

            this.formError = error.toString();
            return throwError(() => error);
        })).subscribe(() => {
         this.router.navigateByUrl("didedu");
      });
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private nav: NavbarService,
    private footer: FooterService
  ) { }

  ngOnInit(): void {
      this.nav.hide();
      this.footer.hide();
  }

}
