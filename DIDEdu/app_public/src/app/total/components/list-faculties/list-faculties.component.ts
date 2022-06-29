import { Component, OnInit } from '@angular/core';
import {DideduDataService} from "../../services/didedu-data.service";
import {University} from "../../classes/university";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {Faculty} from "../../classes/faculty";

@Component({
  selector: 'app-list-faculties',
  templateUrl: './list-faculties.component.html',
  styleUrls: ['./list-faculties.component.css']
})
export class ListFacultiesComponent implements OnInit {
  constructor(
    private dideduDataService: DideduDataService,
  ) { }

  public faculties: Faculty[] = [];
  public currInput: string = '';
  public errorMessage: string = '';

  private getFaculties(): void {
    this.dideduDataService
      .getAllFaculties()
      .pipe(catchError((error: HttpErrorResponse) => {
        this.errorMessage = error.toString();
        this.faculties = [];
        return throwError(() => error);
      })).subscribe((foundFaculties) => (this.faculties = foundFaculties))
  }

  public filter(): void {
    this.refreshData();
  }

  private refreshData() {
    this.errorMessage = '';
    this.dideduDataService
      .getFacultiesFiltered(this.currInput)
      .pipe(catchError((error: HttpErrorResponse) => {
        this.errorMessage = error.toString();
        this.faculties = [];
        return throwError(() => error);
      })).subscribe((foundFaculties) => (this.faculties = foundFaculties));
  }

  ngOnInit(): void {
    this.getFaculties();
  }
}
