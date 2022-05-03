import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router, ActivatedRoute, ParamMap} from "@angular/router";
import { switchMap } from 'rxjs/operators';
import {University} from "../../classes/university";
import {Faculty} from "../../classes/faculty";


@Component({
  selector: 'app-university-details',
  templateUrl: './university-details.component.html',
  styleUrls: ['./university-details.component.css']
})
export class UniversityDetailsComponent implements OnInit {
  public university: University | null = null;
  public currFaculty: Faculty | null = null;

  constructor(
      private nav: NavbarService,
      private footer: FooterService,
      private dideduDataService: DideduDataService,
      private authenticationService: AuthenticationService,
      private router: Router,
      private path: ActivatedRoute
  ) { }

  public getUrl(): string {
    console.log(this.router.routerState.snapshot.url)
    return this.router.routerState.snapshot.url;
  }

  ngOnInit(): void {
      if (!this.authenticationService.isLoggedIn()) {
        this.router.navigateByUrl("login");
      } else {
        this.nav.show();
        this.footer.show();
        this.path.paramMap
          .pipe(
            switchMap((params: ParamMap) => {
              let idUniversity: string = (params.get('idUniversity') || '').toString();
              return this.dideduDataService.getUniversityDetails(idUniversity);
            })
          )
          .subscribe((university: University) => (this.university = university));
      }
  }

}
