import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {DideduDataService} from "../../services/didedu-data.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {User} from "../../classes/user";
import {University} from "../../classes/university";
import {Program} from "../../classes/program";
import {Faculty} from "../../classes/faculty";

@Component({
  selector: 'app-add-faculty',
  templateUrl: './add-faculty.component.html',
  styleUrls: ['./add-faculty.component.css']
})
export class AddFacultyComponent implements OnInit {
  public currUser: User | null = null;
  public currUniversity: University | null = null;
  public programs: Program[] = [];
  public formError = '';
  public formSuccess = '';
  public programError = '';
  public showSpinner: boolean = false;

  public newFaculty = {
    id_faculty: 0,
    title: '',
    abbreviation: '',
    country: '',
    city: '',
    zip: '',
    street: '',
    houseNumber: '',
    contactNumber: '',
    university: 0,
    programs: [],
    controllers: []
  };
  public newProgram = {
    id_program: 0,
    title: '',
    bachelorDegreeYears: 0,
    masterDegreeYears: 0,
    doctorDegreeYears: 0,
    faculty: 0
  }

  constructor(
    private nav: NavbarService,
    private footer: FooterService,
    private dideduDataService: DideduDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  private getCurrUniversity(): void {
    this.dideduDataService
      .getControlledUniversity(this.currUser?.id_user!!)
      .subscribe((foundUniversity) => {
        this.newFaculty.university = foundUniversity.id_university;
        this.currUniversity = foundUniversity;
      })
  }

  public addProgram(): void {
    this.programError = '';
    if (this.newProgram.title.trim() === '') {
      this.programError = 'Title of the faculty is missing!'
    } else if (this.newProgram.bachelorDegreeYears === 0 && this.newProgram.masterDegreeYears === 0 && this.newProgram.doctorDegreeYears === 0) {
      this.programError = 'The program must have at least one degree!'
    } else {
      let programToAdd = new Program();
      programToAdd.title = this.newProgram.title;
      programToAdd.bachelorDegreeYears = this.newProgram.bachelorDegreeYears;
      programToAdd.masterDegreeYears = this.newProgram.masterDegreeYears;
      programToAdd.doctorDegreeYears = this.newProgram.doctorDegreeYears;

      this.programs.push(programToAdd);
      this.newProgram.title = '';
      this.newProgram.bachelorDegreeYears = 0;
      this.newProgram.masterDegreeYears = 0;
      this.newProgram.doctorDegreeYears = 0;
    }
  }

  public deleteProgram(index: number): void {
    this.programs.splice(index, 1);
  }

  public saveFaculty(): void {
    this.formError = '';
    this.formSuccess = '';
    if (!this.newFaculty.title || !this.newFaculty.city || !this.newFaculty.country || !this.newFaculty.zip || !this.newFaculty.street || !this.newFaculty.houseNumber) {
      this.formError = 'Please fill the required data!';
    } else if (this.programs.length === 0) {
      this.formError = 'Please add at least one program!';
    } else {
      this.showSpinner = true;
      this.sendData();
    }
  }

  private sendData() {
    this.dideduDataService
      .addFaculty(this.newFaculty, this.programs)
      .subscribe({
        next: (answer) => {
          this.showSpinner = false;
          this.formError = '';
          this.programError = '';
          this.formSuccess = answer.message;
          this.newFaculty.houseNumber = '';
          this.newFaculty.street = '';
          this.newFaculty.zip = '';
          this.newFaculty.city = '';
          this.newFaculty.country = '';
          this.newFaculty.abbreviation = '';
          this.newFaculty.title = '';
          this.programs = [];
        },
        error: (error) => {
          this.showSpinner = false;
          this.formError = error;
        }
      })
  }

  ngOnInit(): void {
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl("login");
    } else {
      this.currUser = this.authenticationService.getCurrentUser();
      this.dideduDataService
        .getDIDs(this.currUser!!.id_user.toString(), "Auth")
        .subscribe((dids) => {
          if (dids.length > 0) {
            this.getCurrUniversity();
            this.nav.show();
            this.footer.show();
          } else {
            this.router.navigateByUrl('didedu')
          }
        })
    }
  }

}
