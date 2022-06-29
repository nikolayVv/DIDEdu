import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../classes/user";
import {DideduDataService} from "../../services/didedu-data.service";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {Course} from "../../classes/course";

@Component({
  selector: 'app-list-courses',
  templateUrl: './list-courses.component.html',
  styleUrls: ['./list-courses.component.css']
})
export class ListCoursesComponent implements OnInit {
  @Input() user: User | undefined | null;

  public errorMessage = '';
  public courses: Course[] = [];

  constructor(
    private dideduDataService: DideduDataService,
  ) { }

  private getCourses() {
    if (this.user?.role === 'professor') {
      this.dideduDataService
        .getProfessorCourses(this.user!!.id_user.toString())
        .pipe(catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.toString();
          this.courses = [];
          return throwError(() => error);
        })).subscribe((foundCourses) => (this.courses = foundCourses))
    } else if (this.user?.role === 'student') {
      this.dideduDataService
        .getStudentCourses(this.user!!.id_user.toString())
        .pipe(catchError((error: HttpErrorResponse) => {
          this.errorMessage = error.toString();
          this.courses = [];
          return throwError(() => error);
        })).subscribe((foundCourses) => (this.courses = foundCourses))
    } else {
      this.errorMessage = 'Only professors and students are allowed to see the courses';
      this.courses = [];
    }
  }

  public delete(idCourse: string) {

  }

  ngOnInit(): void {
    this.getCourses();
  }

}
