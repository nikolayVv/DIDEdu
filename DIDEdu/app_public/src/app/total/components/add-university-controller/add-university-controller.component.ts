import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-add-university-controller',
  templateUrl: './add-university-controller.component.html',
  styleUrls: ['./add-university-controller.component.css']
})
export class AddUniversityControllerComponent implements OnInit {
  public formError: string = '';

  public controllerData = {
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  }

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private path: ActivatedRoute
  ) { }

  public sendData(): void {
    this.formError = '';
    if (!this.controllerData.name || !this.controllerData.surname || !this.controllerData.email || !this.controllerData.password) {
      this.formError = 'All data is required, please try again!';
    } else if (this.controllerData.password !== this.controllerData.confirmPassword) {
      this.formError = `The 'Password' must be the same as the 'Confirm password'!`;
    } else if (this.controllerData.password.length < 8) {
      this.formError = `The password must contain at least 8 symbols!`;
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.controllerData.email)) {
      this.formError = `The 'Email' must have a right format!`
    } else {
      this.checkUserData();
    }
  }

  private checkUserData(): void {
    this.path.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          let idUniversity: string = (params.get('idUniversity') || '').toString();
          return this.dideduDataService.registerUniversityController(idUniversity, this.controllerData);
        })
      )
      .subscribe( {
        next: (controller) => {
          this.router.navigateByUrl('didedu');
        },
        error: (error) => {
          this.formError = error;
        }
      });
  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.nav.show();
      this.footer.show();
    }
  }

}
