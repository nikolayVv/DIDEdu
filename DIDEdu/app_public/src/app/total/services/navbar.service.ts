import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible: boolean;

  constructor() {
      this.visible = false;
  }

  public hide() {
      this.visible = false;
  }

  public show() {
      this.visible = true;
  }

  public toggle() {
      this.visible = !this.visible;
  }
}
