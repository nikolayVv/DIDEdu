import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InfoPageComponent } from "../../total/components/info-page/info-page.component";
import { AddUniversityComponent } from "../../total/components/add-university/add-university.component";
import { AddFacultyComponent } from "../../total/components/add-faculty/add-faculty.component";
import { AddUniversityControllerComponent } from "../../total/components/add-university-controller/add-university-controller.component";
import { UniversityDetailsComponent } from "../../total/components/university-details/university-details.component";
import {UserDetailsComponent} from "../../total/components/user-details/user-details.component";
import { LoginComponent } from "../../total/components/login/login.component";
import {FacultyDetailsComponent} from "../../total/components/faculty-details/faculty-details.component";
import {HomePageComponent} from "../../total/components/home-page/home-page.component";
import {CourseDetailsComponent} from "../../total/components/course-details/course-details.component";
import {ListCredentialsComponent} from "../../total/components/list-credentials/list-credentials.component";

const routes: Routes = [
  { path: '', component: InfoPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'didedu', component: HomePageComponent },
  { path: 'didedu/addUniversity', component: AddUniversityComponent },
  { path: 'didedu/addFaculty', component: AddFacultyComponent },
  { path: 'didedu/faculties/:idFaculty', component: FacultyDetailsComponent },
  { path: 'didedu/universities/:idUniversity/addController', component: AddUniversityControllerComponent },
  { path: 'didedu/universities/:idUniversity', component: UniversityDetailsComponent },
  { path: 'didedu/users/:idUser', component: UserDetailsComponent },
  { path: 'didedu/universities/:idUniversity/faculties/:idFaculty', component: FacultyDetailsComponent },
  { path: 'didedu/courses/:idCourse', component: CourseDetailsComponent },
  { path: 'didedu/credentials', component: ListCredentialsComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRouterModule { }
