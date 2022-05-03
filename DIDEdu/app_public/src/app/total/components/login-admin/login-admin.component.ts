import {Component, Input, OnInit} from '@angular/core';
import {Faculty} from "../../classes/faculty";
import {University} from "../../classes/university";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent implements OnInit {
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
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("didedu");
    } else {
      this.nav.hide();
      this.footer.hide();
    }
  }
}
