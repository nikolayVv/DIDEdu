import {Component, Input, OnInit} from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {University} from "../../classes/university";
import {DideduDataService} from "../../services/didedu-data.service";

@Component({
  selector: 'app-list-universities',
  templateUrl: './list-universities.component.html',
  styleUrls: ['./list-universities.component.css']
})

export class ListUniversitiesComponent implements OnInit {
  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  public universities: University[] = [];

  private getUniversities(): void {
    this.dideduDataService
      .getAllUniversities()
      .subscribe((foundUniversities) => (this.universities = foundUniversities))
  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.nav.show();
      this.footer.show();
      this.getUniversities();
    }
  }

}