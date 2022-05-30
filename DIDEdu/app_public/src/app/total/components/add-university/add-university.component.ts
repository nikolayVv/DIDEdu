import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";

@Component({
  selector: 'app-add-university',
  templateUrl: './add-university.component.html',
  styleUrls: ['./add-university.component.css']
})
export class AddUniversityComponent implements OnInit {
  public formError: string = '';
  public formSuccess: string = '';

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  public universityData = {
    title: '',
    abbreviation: '',
    country: '',
    city: '',
    zip: '',
    street: '',
    houseNumber: ''
  }

  public sendData(): void {
    this.formError = '';
    this.formSuccess = '';
    if (!this.universityData.title || !this.universityData.city || !this.universityData.country || !this.universityData.zip || !this.universityData.street || !this.universityData.houseNumber) {
      this.formError = 'All data is required, please try again!';
    } else {
      this.checkUserData();
    }
  }

  private checkUserData(): void {
    this.dideduDataService
      .addUniversity(this.universityData)
      .subscribe({
        next: (answer) => {
          this.formSuccess = answer.message;
          this.universityData.houseNumber = '';
          this.universityData.street = '';
          this.universityData.zip = '';
          this.universityData.city = '';
          this.universityData.country = '';
          this.universityData.abbreviation = '';
          this.universityData.title = '';
        },
        error: (error) => {
          this.formError = error;
        }
      })
  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      let currUser = this.authenticationService.getCurrentUser();
      if (!currUser?.hasDid) {
        this.router.navigateByUrl('didedu')
      } else {
        this.nav.show();
        this.footer.show();
      }
    }
  }

}
