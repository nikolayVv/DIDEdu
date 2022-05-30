import {Component, OnInit, Output} from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {User} from "../../classes/user";
import {Router} from "@angular/router";
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  public currUser: User | null = null
  public currDid: string = '';
  public hasDid: boolean = false;

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.currUser = this.authenticationService.getCurrentUser();
      this.dideduDataService
        .getDIDs(this.currUser!!.id_user.toString())
        .subscribe((dids) => {
          console.log(dids);
          if (this.currUser?.role === 'admin' || (dids.length > 0 && this.currUser?.role !== 'admin')) {
            this.hasDid = true;
            this.nav.show();
            this.footer.show();
          }
        });
    }
  }

}
