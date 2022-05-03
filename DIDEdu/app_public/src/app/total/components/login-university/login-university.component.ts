import {Component, Input, OnInit} from '@angular/core';
import { NavbarService } from "../../services/navbar.service";
import { FooterService } from "../../services/footer.service";
import { DideduDataService } from "../../services/didedu-data.service";
import { University } from "../../classes/university";
import { Faculty } from "../../classes/faculty";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login-university',
  templateUrl: './login-university.component.html',
  styleUrls: ['./login-university.component.css']
})
export class LoginUniversityComponent implements OnInit {
  public visibleFaculties: boolean = false;
  public activeButton: boolean = false;
  public currUniversity: University | null = null;
  public dataChosen: boolean = false;
  public currFaculty: Faculty | null = null;

  constructor(
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private nav: NavbarService,
    private footer: FooterService
  ) { }

  public currFaculties: Faculty[] = [];
  public universities: University[] = [];

  private getUniversities(): void {
    this.dideduDataService
      .getAllUniversities()
      .subscribe((foundUniversities) => (this.universities = foundUniversities))
  }

  public trackFaculty (index: number, faculty: Faculty) {
    return faculty._id;
  }


  public check(event: Event, type: string) {
    let value = (event.target as HTMLInputElement).value;
    if (value.trim() !== "") {
      if (type === "list") {
            this.currFaculties = [];
            this.currUniversity = null;
            this.visibleFaculties = false;
            for (let i = 0; i < this.universities.length; i++) {
                if (value.trim() === this.universities[i].title) {
                    this.currUniversity = this.universities[i];
                    this.currFaculties = this.universities[i].faculties;
                    this.visibleFaculties = true;
                    break
                }
            }
        } else if (type === "button") {
            this.currFaculty = null;
            this.activeButton = false;
            for (let i = 0; i < this.currFaculties.length; i++) {
                if (value.trim() === this.currFaculties[i].title) {
                    this.currFaculty = this.currUniversity!!.faculties[i];
                    this.activeButton = true;
                    break
                }
            }
        }
    } else {
        if (type === "list") {
            this.currUniversity = null;
            this.currFaculties = [];
            this.visibleFaculties = false;
        } else if (type === "button") {
            this.currFaculty = null;
            this.activeButton = false;
        }
    }
  }

  ngOnInit(): void {
      if (this.authenticationService.isLoggedIn()) {
          this.router.navigateByUrl("didedu");
      } else {
          this.nav.hide();
          this.footer.hide();
          this.getUniversities();
      }
  }
}
