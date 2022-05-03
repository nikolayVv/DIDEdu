import {Component, Input, OnInit} from '@angular/core';
import {Faculty} from "../../classes/faculty";
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-faculty-details',
  templateUrl: './faculty-details.component.html',
  styleUrls: ['./faculty-details.component.css']
})
export class FacultyDetailsComponent implements OnInit {
  @Input() faculty: Faculty | null = null;
  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private path: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.nav.show();
      this.footer.show();
    }
  }

}
