import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListUniversitiesComponent } from "../total/components/list-universities/list-universities.component";
import { LoginUniversityComponent } from "../total/components/login-university/login-university.component";
import { InfoPageComponent } from "../total/components/info-page/info-page.component";

const routes: Routes = [
  { path: '', component: InfoPageComponent },
  { path: 'login', component: LoginUniversityComponent },
  { path: 'didedu', component: ListUniversitiesComponent }
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
