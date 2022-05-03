import { Component, OnInit } from '@angular/core';
import { User } from "../../classes/user";
import { AuthenticationService } from "../../services/authentication.service";
import { DideduDataService } from "../../services/didedu-data.service";
import { University } from "../../classes/university";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor(
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
  ) { }

  public universities: University[] = [];

  private getUniversities(): void {
    this.dideduDataService
      .getAllUniversities()
      .subscribe((foundUniversities) => (this.universities = foundUniversities))
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public getUser(): User | null {
    return this.authenticationService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getUniversities();
  }

}
