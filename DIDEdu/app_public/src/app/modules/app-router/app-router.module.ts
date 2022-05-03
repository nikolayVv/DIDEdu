import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListUniversitiesComponent } from "../../total/components/list-universities/list-universities.component";
import { LoginUniversityComponent } from "../../total/components/login-university/login-university.component";
import { InfoPageComponent } from "../../total/components/info-page/info-page.component";
import { AddUniversityComponent } from "../../total/components/add-university/add-university.component";
import { AddFacultyComponent } from "../../total/components/add-faculty/add-faculty.component";
import { AddUniversityControllerComponent } from "../../total/components/add-university-controller/add-university-controller.component";
import { UniversityDetailsComponent } from "../../total/components/university-details/university-details.component";
import {LoginAdminComponent} from "../../total/components/login-admin/login-admin.component";
import {UserDetailsComponent} from "../../total/components/user-details/user-details.component";
import {Faculty} from "../../total/classes/faculty";
import {FacultyDetailsComponent} from "../../total/components/faculty-details/faculty-details.component";

const routes: Routes = [
  { path: '', component: InfoPageComponent },
  { path: 'login', component: LoginUniversityComponent },
  { path: 'loginAdministrator', component: LoginAdminComponent },
  { path: 'didedu', component: ListUniversitiesComponent },
  { path: 'didedu/addUniversity', component: AddUniversityComponent },
  { path: 'didedu/addFaculty', component: AddFacultyComponent },
  { path: 'didedu/universities/:idUniversity/addController', component: AddUniversityControllerComponent },
  { path: 'didedu/universities/:idUniversity', component: UniversityDetailsComponent },
  { path: 'didedu/universities/:idUniversity/controller', component: UserDetailsComponent },
  { path: 'didedu/universities/:idUniversity/faculties/:idFaculty', component: FacultyDetailsComponent }
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
