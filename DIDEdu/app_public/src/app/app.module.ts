import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {AppRouterModule} from "./modules/app-router/app-router.module";

import { InfoPageComponent } from './total/components/info-page/info-page.component';
import { LayoutComponent } from './total/components/layout/layout.component';
import { HtmlNewLinePipe } from './total/pipes/html-new-line.pipe';
import { NavbarComponent } from './total/components/navbar/navbar.component';
import { FooterComponent } from './total/components/footer/footer.component';
import { LoginComponent } from "./total/components/login/login.component";
import { DideduDataService } from "./total/services/didedu-data.service";
import { ListUniversitiesComponent } from './total/components/list-universities/list-universities.component';
import { AddUniversityComponent } from './total/components/add-university/add-university.component';
import { AddFacultyComponent } from './total/components/add-faculty/add-faculty.component';
import { AddUniversityControllerComponent } from './total/components/add-university-controller/add-university-controller.component';
import { UniversityDetailsComponent } from './total/components/university-details/university-details.component';
import { UserDetailsComponent } from './total/components/user-details/user-details.component';
import { FacultyDetailsComponent } from './total/components/faculty-details/faculty-details.component';
import { HomePageComponent } from './total/components/home-page/home-page.component';
import { SpinnerComponent } from './total/components/spinner/spinner.component';
import { RegisterFirstDidComponent } from './total/components/register-first-did/register-first-did.component';
import { WalletLoginComponent } from './total/components/wallet-login/wallet-login.component';

@NgModule({
  declarations: [
    InfoPageComponent,
    LayoutComponent,
    HtmlNewLinePipe,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    ListUniversitiesComponent,
    AddUniversityComponent,
    AddFacultyComponent,
    AddUniversityControllerComponent,
    UniversityDetailsComponent,
    UserDetailsComponent,
    FacultyDetailsComponent,
    HomePageComponent,
    SpinnerComponent,
    RegisterFirstDidComponent,
    WalletLoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRouterModule,
  ],
  providers: [
    DideduDataService
  ],
  bootstrap: [LayoutComponent]
})

export class AppModule { }
