import {Component, Input, OnInit} from '@angular/core';
import { FooterService } from "../../services/footer.service";
import {User} from "../../classes/user";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  @Input() user: User | undefined | null;
  @Input() isLoggedIn: boolean | undefined;

  constructor(public footer: FooterService, private authenticationService: AuthenticationService) { }

  public logout(): void {
    this.authenticationService.logout();
  }

  ngOnInit(): void {
  }

}
