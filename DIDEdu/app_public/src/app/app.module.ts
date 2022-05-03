import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {AppRouterModule} from "./app-router/app-router.module";

import { InfoPageComponent } from './total/components/info-page/info-page.component';
import { LayoutComponent } from './total/components/layout/layout.component';
import { LoginUniversityComponent } from './total/components/login-university/login-university.component';
import { HtmlNewLinePipe } from './total/pipes/html-new-line.pipe';
import { NavbarComponent } from './total/components/navbar/navbar.component';
import { FooterComponent } from './total/components/footer/footer.component';
import { LoginComponent } from "./total/components/login/login.component";
import { DideduDataService } from "./total/services/didedu-data.service";
import { ListUniversitiesComponent } from './total/components/list-universities/list-universities.component';

@NgModule({
  declarations: [
    InfoPageComponent,
    LayoutComponent,
    LoginUniversityComponent,
    HtmlNewLinePipe,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    ListUniversitiesComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DideduDataService
  ],
  bootstrap: [LayoutComponent]
})

export class AppModule { }
