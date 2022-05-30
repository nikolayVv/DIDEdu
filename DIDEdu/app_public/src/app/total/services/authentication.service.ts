import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from "../classes/storage";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../classes/user';
import { ResultAuthentication } from "../classes/result-authentication";
import { DideduDataService } from "./didedu-data.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(@Inject(BROWSER_STORAGE) private storage: Storage, private dideduDataService: DideduDataService) { }

  public login(user: User): Observable<ResultAuthentication> {
      return this.dideduDataService.login(user).pipe(
          tap((resultAuthentication: ResultAuthentication) => {
              this.setToken(resultAuthentication['token']);
          })
      )
  }

  public logout(): void {
      this.storage.removeItem('didedu-token');
  }

  private b64Utf8(value: string): string {
      return decodeURIComponent(
          Array.prototype.map
            .call(atob(value), (char: string) => {
                return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
            })
          .join('')
      );
  }

  public isLoggedIn(): boolean {
      const token: string | null = this.getToken();

      if (token) {
          const value = JSON.parse(this.b64Utf8(token.split('.')[1]));
          return value.exp > Date.now() / 1000;
      } else {
          return false;
      }
  }

  public getCurrentUser(): User | null {
      if (this.isLoggedIn()) {
          const token: string | null = this.getToken();
          if (token) {
              const { id_user, email, name, role, hasDid } = JSON.parse(this.b64Utf8(token.split('.')[1]));
              return { id_user, email, name, role, hasDid } as User;
          }
      }
      return null;
  }

  public getToken(): string | null {
      return this.storage.getItem("didedu-token");
  }

  public setToken(token: string): void {
      this.storage.setItem('didedu-token', token);
  }
}
