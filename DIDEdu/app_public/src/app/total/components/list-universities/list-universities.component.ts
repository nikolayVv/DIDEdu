import { Component, OnInit } from '@angular/core';
import {NavbarService} from "../../services/navbar.service";
import {FooterService} from "../../services/footer.service";

@Component({
  selector: 'app-list-universities',
  templateUrl: './list-universities.component.html',
  styleUrls: ['./list-universities.component.css']
})
export class ListUniversitiesComponent implements OnInit {

  constructor(private nav: NavbarService, private footer: FooterService) { }

  ngOnInit(): void {
    this.nav.show();
    this.footer.show()
  }

}
