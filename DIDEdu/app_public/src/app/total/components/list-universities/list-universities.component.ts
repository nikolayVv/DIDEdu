import {Component, Input, OnInit} from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {University} from "../../classes/university";
import {DideduDataService} from "../../services/didedu-data.service";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";

@Component({
  selector: 'app-list-universities',
  templateUrl: './list-universities.component.html',
  styleUrls: ['./list-universities.component.css']
})

export class ListUniversitiesComponent implements OnInit {
  constructor(
    private dideduDataService: DideduDataService,
  ) { }

  public universities: University[] = [];
  public currFilter: string = 'name';
  public currInput: string = '';
  public errorMessage: string = '';

  private getUniversities(): void {
      this.dideduDataService
        .getAllUniversities()
        .pipe(catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.toString();
          this.universities = [];
          return throwError(() => error);
        })).subscribe((foundUniversities) => (this.universities = foundUniversities))
  }

  public changeFilter(filter: string): void {
      if (this.currFilter !== filter) {
          this.currFilter = filter;
          this.refreshData();
      }
  }

  public filter(): void {
      this.refreshData();
  }

  private refreshData() {
      this.errorMessage = '';
      this.dideduDataService
        .getUniversitiesFiltered(this.currFilter, this.currInput)
        .pipe(catchError((error: HttpErrorResponse) => {
            this.errorMessage = error.toString();
            this.universities = [];
            return throwError(() => error);
        })).subscribe((foundUniversities) => (this.universities = foundUniversities));
  }

  ngOnInit(): void {
      this.getUniversities();
  }

}
