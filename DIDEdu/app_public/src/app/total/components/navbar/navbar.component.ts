import { Component, OnInit, Input } from '@angular/core';
import { NavbarService } from "../../services/navbar.service";
import {User} from "../../classes/user";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @Input() user: User | undefined | null;
  @Input() isLoggedIn: boolean | undefined;

  private currentActive: any

  constructor(
    public router: Router,
    public nav: NavbarService,
    private authenticationService: AuthenticationService
  ) { }

  public getUrl(): string {
      return this.router.routerState.snapshot.url;
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  ngOnInit(): void {

  }

}
