import {Component, Input, OnInit, Output} from '@angular/core';
import {EventEmitter} from "@angular/core";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {DideduDataService} from "../../services/didedu-data.service";

@Component({
  selector: 'app-wallet-login',
  templateUrl: './wallet-login.component.html',
  styleUrls: ['./wallet-login.component.css']
})
export class WalletLoginComponent implements OnInit {
  @Input() display: string = 'none';
  @Output() credentialsEvent = new EventEmitter();
  @Output() closeEvent = new EventEmitter();

  public formError = '';
  public walletCredentials = {
    username: '',
    password: ''
  }

  constructor(
    private dideduDataService: DideduDataService
  ) {}

  public close(): void {
    this.closeEvent.emit();
    this.cleanModal();
  }

  public submit(): void {
    this.formError = '';
    if (!this.walletCredentials.password || !this.walletCredentials.username) {
      this.formError = 'All data is required to connect with the digital wallet, please try again!';
    } else {
      this.dideduDataService
        .getWalletAcc(this.walletCredentials.username, this.walletCredentials.password)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
        this.credentialsEvent.emit(answer.user);
        this.cleanModal();
      });
    }
  }

  private cleanModal(): void {
    this.walletCredentials.username = '';
    this.walletCredentials.password = '';
    this.formError = '';
  }

  ngOnInit(): void {
  }

}
