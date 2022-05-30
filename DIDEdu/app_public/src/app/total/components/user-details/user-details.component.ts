import {Component, Input, OnInit} from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {University} from "../../classes/university";
import {User} from "../../classes/user";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  @Input() user: User | null = null;

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
      let currUser = this.authenticationService.getCurrentUser();
      this.dideduDataService
        .getDIDs(currUser!!.id_user.toString())
        .subscribe((dids) => {
          if (dids.length > 0) {
            this.nav.show();
            this.footer.show();
          } else {
            this.router.navigateByUrl('didedu')
          }
        })
    }
  }

}
