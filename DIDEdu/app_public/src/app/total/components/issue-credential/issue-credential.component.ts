import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DideduDataService} from "../../services/didedu-data.service";
import {catchError} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {environment} from "../../../../environments/environment";
import {User} from "../../classes/user";
import {Thread} from "../../classes/thread";
import {Course, CourseDetails} from "../../classes/course";
import {Obligation, ObligationsGroup} from "../../classes/obligation";
import {Batch} from "../../classes/batch";
import {Holder, HolderIssue} from "../../classes/holder";
import {Credential, CredentialPresent} from "../../classes/credential";

@Component({
  selector: 'app-issue-credential',
  templateUrl: './issue-credential.component.html',
  styleUrls: ['./issue-credential.component.css']
})
export class IssueCredentialComponent implements OnInit {
  @Input() display: string = 'none';
  @Input() type: string = '';
  @Input() user: User | null = null;
  @Input() course: CourseDetails | null = null;
  @Input() currGroup: ObligationsGroup | null = null;
  @Input() currObligation: Obligation | null = null;
  @Input() mnemonic: string[] = [];
  @Input() username: string = '';
  @Input() passphrase: string = '';
  @Input() credentials: CredentialPresent[] = [];
  @Input() studentDid: string = '';
  @Input() courseTitle: string = '';
  @Input() credentialDetails: Credential[] = [];

  @Output() credentialsEvent = new EventEmitter();
  @Output() closeEvent = new EventEmitter();

  public formError = '';
  public did = '';
  public obligationsGroup = '';
  public obligation = '';
  public disabled: string = '';
  public typeIssuing: string = 'all';
  public students: User[] = []
  private studentsVal: number[] = [];
  private statusThreadArray: Thread[] = [];
  public currCredentialDetails: Credential[] = [];
  public currIndex = -1;
  public currPresentation: CredentialPresent | null = null;
  public coursesForEnrollment: Course[] = [];
  public currCoursePresentations: Course | null = null;

  public obligationCredential: Batch = {
    title: this.currObligation ? this.currObligation?.title : '',
    minVal: 0,
    maxVal: 0,
    holders: [],
  }

  public presentationCredential: any = {
    type: 0,
    exam: 0,
    credentials: [],
    validAuth: false,
    validEnroll: false
  }

  //Credential will have
  //min value to pass
  //max value
  //name
  //value
  //...

  constructor(
    private dideduDataService: DideduDataService
  ) { }

  public close(): void {
    this.closeEvent.emit();
    this.cleanModal();
  }

  public changeVal(event: any, index: number): void {
    this.studentsVal[index] = event.target.value;
  }

  public submitEnrollmentCredential(): void {
    this.formError = '';
    let did = this.did.toLowerCase().trim();

    if (!did) {
      this.formError = 'All data is required, please try again!';
    } else if (did.split(":")[0] !== 'did') {
      this.formError = 'Invalid format! The DID should start with "did"!';
    } else if (did.split(":")[2].length !== 64) {
      this.formError = 'Invalid format! The DID Method-Specific Identifier must be exactly 64 chars long!'
    } else {
      this.issueEnrollmentCredential(did);
    }
  }

  public submitObligationsGroup(type: string): void {
    this.formError = '';

    if (!this.obligationsGroup) {
      this.formError = 'All data is required, please try again!';
    } else {
      this.createObligationsGroup(type);
    }
  }

  public submitObligation(): void {
    this.formError = '';

    if (!this.obligation) {
      this.formError = 'All data is required, please try again!';
    } else {
      this.createObligation();
    }
  }

  public submitPresentation(): void {
    this.disabled = 'disabled'
    this.formError = '';

    if (this.presentationCredential.credentials.length === 0 || this.presentationCredential.credentials.length === 2 && this.presentationCredential.validAuth && this.presentationCredential.validEnroll) {
      this.disabled = '';
      this.formError = 'You must choose at least one credential to add to the presentation!';
    } else if (!this.presentationCredential.validAuth) {
      this.disabled = '';
      this.formError = 'The authentication credential for DIDEdu is required!';
    } else if (!this.presentationCredential.validEnroll) {
      this.disabled = '';
      this.formError = `The enrollment credential for the course '${this.course?.title} is required'!`;
    } else if (this.presentationCredential.type === 0) {
      this.disabled = '';
      this.formError = 'You must choose presentation type!';
    } else if (this.presentationCredential.type === '1' && this.presentationCredential.exam === 0) {
      this.disabled = '';
      this.formError = 'You must choose exam which you to apply for!';
    } else {
      let didHolders: string[] = []
      this.course?.professors.forEach(professor => {
        didHolders.push(professor.did);
      })
      this.dideduDataService
        .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
        .pipe(catchError((error: HttpErrorResponse) => {
          this.disabled = '';
          this.formError = error.toString();
          return throwError(() => error);
        })).subscribe((answer) => {
          let presType = '';

          switch (this.presentationCredential.type) {
            case '1':
              presType = `Exam application`
              break;
            case '2':
              presType = 'Course enrollment'
              break;
            case '3':
              presType = 'Program enrollment'
              break;
            case '4':
              presType = 'Diploma'
              break;
            case '5':
              presType = 'DIDEdu'
              break;
          }
          this.dideduDataService
            .getDIDs(this.user?.id_user.toString()!!, this.course?.title!!)
            .subscribe((enrollmentDids) => {
              if (enrollmentDids.length === 0) {
                this.disabled = '';
                this.formError = "Couldn't find any enrollment dids for this account"
              } else {
                this.dideduDataService
                  .issuePresentation(
                    `${this.user?.name}(${this.user?.id_user}) - ${presType}, Presentation (${this.currCoursePresentations ? this.currCoursePresentations?.title : this.course?.title})`,
                    this.currCoursePresentations ? this.currCoursePresentations?.title : this.course?.title!!,
                    this.course?.title!!,
                    answer.user.username,
                    answer.user.mnemonic,
                    answer.user.didList[0].title,
                    didHolders,
                    this.presentationCredential.credentials,
                    this.user?.email!!,
                    this.user?.id_user.toString()!!,
                    enrollmentDids[0].did,
                    this.user?.role,
                    this.currCoursePresentations ? this.currCoursePresentations.presentations : []
                  ).pipe(catchError((error2: HttpErrorResponse) => {
                  this.disabled = '';
                  this.formError = error2.toString();
                  return throwError(() => error2);
                })).subscribe(answer2 => {
                  this.dideduDataService
                    .changeObligationStatus(this.currObligation?.id_obligation!!, 'Issued')
                    .subscribe(async (answer3) => {
                      this.dideduDataService
                        .addCredentialToAcc(
                          enrollmentDids[0].did,
                          `${this.user?.name}(${this.user?.id_user}) - ${presType}, Presentation (${this.currCoursePresentations ? this.currCoursePresentations?.title : this.course?.title})`,
                          answer2.credential,
                          answer2.operationId,
                          answer2.hash,
                          answer2.batchId
                        ).subscribe((answer4) => {
                          let newThread = new Thread();
                          newThread.currThread = setInterval(() => this.checkStatus(answer2.operationId, enrollmentDids[0].did, answer4._id, answer2.hash), 7000);
                          newThread.currStatus = '';
                          newThread.did = enrollmentDids[0].did;
                          this.statusThreadArray.push(newThread);

                          this.disabled = '';
                          this.credentialsEvent.emit();
                          this.cleanModal();
                        });
                    })
                });
              }
            })
      });


    }
  }

  public submitCredential(): void {
    this.disabled = 'disabled';
    this.formError = '';

    if (this.obligationCredential.holders.length === 0) {
      this.disabled = '';
      this.formError = 'You need to choose at least one student to issue the credential to!';
    } else {
      this.dideduDataService
        .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
        .pipe(catchError((error1: HttpErrorResponse) => {
          this.disabled = '';
          this.formError = error1.toString();
          return throwError(() => error1);
        })).subscribe((answer1) => {
          if (answer1.user) {
            let data: HolderIssue[] = [];

            this.obligationCredential.holders.forEach(holder => {
              data.push({
                did: holder.user.did,
                credential: holder.credential
              })
            });
            this.dideduDataService
              .issueBatch(
                this.username,
                this.mnemonic,
                this.passphrase,
                data,
              ).pipe(catchError((error2: HttpErrorResponse) => {
              this.disabled = '';
              this.formError = error2.toString();
              return throwError(() => error2);
            })).subscribe((answer2) => {
              this.dideduDataService
                .changeObligationStatus(this.currObligation?.id_obligation!!, 'Issued')
                .subscribe(async (answer3) => {
                  await Promise.all(this.obligationCredential.holders.map(async (holder, index) => {
                    await this.dideduDataService
                      .addCredentialToAcc(
                        holder.user.did,
                        `${this.course?.title} (${this.currObligation?.title} - ${this.currGroup?.title})`,
                        answer2.credentials[index],
                        answer2.operationId,
                        answer2.hash,
                        answer2.batchId
                      ).subscribe((answer4) => {
                        let newThread = new Thread();
                        newThread.currThread = setInterval(() => this.checkStatus(answer2.operationId, holder.user.did, answer4._id, answer2.hash), 7000);
                        newThread.currStatus = '';
                        newThread.did = holder.user.did;
                        this.statusThreadArray.push(newThread);
                      })
                  }));
                  this.disabled = '';
                  this.credentialsEvent.emit();
                  this.cleanModal();
                })
            });
          }
      });
    }
  }

  public verifyCredential(): void {

  }

  private createObligation(): void {
    this.disabled = 'disabled';
    this.dideduDataService
      .addObligation(this.currGroup!!.id_obligations_group, this.obligation)
      .pipe(catchError((error1: HttpErrorResponse) => {
        this.disabled = '';
        this.formError = error1.toString();
        return throwError(() => error1);
      })).subscribe((answer) => {
        this.disabled = '';
        this.credentialsEvent.emit();
        this.cleanModal();
    });
  }

  private createObligationsGroup(type: string): void {
    this.disabled = 'disabled';
    this.dideduDataService
      .addObligationsGroup(this.obligationsGroup, this.course?.id_course!!, type)
      .pipe(catchError((error1: HttpErrorResponse) => {
        this.disabled = '';
        this.formError = error1.toString();
        return throwError(() => error1);
      })).subscribe((answer) => {
        this.disabled = '';
        this.credentialsEvent.emit();
        this.cleanModal();
    })
  }

  private issueEnrollmentCredential(did: string) {
    this.disabled = 'disabled';
    this.dideduDataService
      .checkDID(did)
      .pipe(catchError((error1: HttpErrorResponse) => {
        this.disabled = '';
        this.formError = error1.toString();
        return throwError(() => error1);
      })).subscribe((answer1) => {
      this.dideduDataService
        .getAllDIDs()
        .subscribe((answer2) => {
          let alreadyIn = false;
          for (let i = 0; i < answer2.length; i++) {
            if (answer2[i].did === did && answer2[i].title === this.course?.title) {
              alreadyIn = true;
              break;
            }
          }
          if (alreadyIn) {
            this.disabled = '';
            this.formError = `The did '${did}' is already in the database!`;
          } else {
            this.dideduDataService
              .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
              .pipe(catchError((error3: HttpErrorResponse) => {
                this.disabled = '';
                this.formError = error3.toString();
                return throwError(() => error3);
              })).subscribe((answer3) => {
              let credential = [
                {
                  key: "credentialName",
                  value: this.course?.title + " (Enrollment)",
                },
                {
                  key: "userEmail",
                  value: this.user?.email
                },
                {
                  key: "userId",
                  value: this.user?.id_user
                },
                {
                  key: "role",
                  value: this.user?.role
                }
              ]
              if (answer3.user) {
                this.dideduDataService
                  .issueCredential(
                    answer3.user.username,
                    answer3.user.mnemonic,
                    environment.AUTH_CREDENTIAL_PASSPHRASE,
                    did,
                    credential
                  ).pipe(catchError((error4: HttpErrorResponse) => {
                    this.disabled = '';
                    this.formError = error4.toString();
                    return throwError(() => error4);
                })).subscribe((answer4) => {
                  //Add in the user's acc
                  this.dideduDataService
                    .addCredentialToAcc(
                      did,
                      this.course?.title!! + " (Enrollment)",
                      answer4.credential,
                      answer4.operationId,
                      answer4.hash,
                      answer4.batchId
                    ).pipe(catchError((error5: HttpErrorResponse) => {
                      this.disabled = '';
                      this.formError = error5.toString();
                      return throwError(() => error5);
                  })).subscribe((answer5) => {
                    this.dideduDataService
                      .addDID(this.user!!.id_user.toString(), did, this.course?.title!!)
                      .pipe(catchError((error6: HttpErrorResponse) => {
                        this.disabled = '';
                        this.formError = error6.toString();
                        return throwError(() => error6);
                      })).subscribe((answer6) => {
                        let newThread = new Thread()
                        newThread.currThread = setInterval(() => this.checkStatus(answer4.operationId, did, answer5._id, answer4.hash), 7000);
                        newThread.currStatus = '';
                        newThread.did = did;
                        this.disabled = '';
                        this.statusThreadArray.push(newThread);
                        this.credentialsEvent.emit();
                        this.cleanModal();
                    });
                  });
                });
              } else {
                this.disabled = '';
                this.formError = 'There was an error sending the credential! Please try again with another DID!';
              }
            });
          }
        });
    });
  }

  public add(student: User, index: number): void {
    this.formError = '';
    if (!this.studentsVal[index] || this.studentsVal[index] > this.obligationCredential.maxVal) {
      this.formError = 'The student must have a valid value for the credential';
    } else if (!student.did) {
      this.formError = "Couldn't find an enrollment DID in the database for the chosen user";
    } else {
      let did = student.did;

      let holder = new Holder();
      holder.user = student;
      holder.value = this.studentsVal[index];

      this.dideduDataService
        .checkDID(did)
        .pipe(catchError((error1: HttpErrorResponse) => {
          this.disabled = '';
          this.formError = error1.toString();
          return throwError(() => error1);
        })).subscribe((answer1) => {
          let credential: Credential[] = [
            {
              key: "credentialName",
              value: `${this.course?.title} (${this.currObligation?.title} - ${this.currGroup?.title})`,
            },
            {
              key: "credentialType",
              value: this.currGroup?.type!!
            },
            {
              key: "maxValue",
              value: this.obligationCredential.maxVal.toString()
            },
            {
              key: "minValue",
              value: this.obligationCredential.minVal.toString()
            },
            {
              key: "value",
              value: holder.value.toString()
            },
            {
              key: "result",
              value: holder.value >= this.obligationCredential.minVal ? 'Passed' : 'Failed'
            },
            {
              key: "userName",
              value: holder.user.name
            },
            {
              key: "userEmail",
              value: student?.email!!
            },
            {
              key: "userId",
              value: student?.id_user!!.toString()
            },
            {
              key: "role",
              value: student?.role!!
            }
          ];
          holder.credential = credential;
      });

      this.studentsVal = [];
      this.course?.students.splice(index, 1);
      this.obligationCredential.holders.push(holder);
    }
  }

  public verifyPresentation(type: string): void {
    this.formError = '';
    let did = this.did.toLowerCase().trim();

    if (!did) {
      this.formError = 'All data is required, please try again!';
    } else if (did.split(":")[0] !== 'did') {
      this.formError = 'Invalid format! The DID should start with "did"!';
    } else if (did.split(":")[2].length !== 64) {
      this.formError = 'Invalid format! The DID Method-Specific Identifier must be exactly 64 chars long!'
    } else if (this.currPresentation === null) {
      this.formError = 'You have to choose your presentation!'
    } else {
      this.disabled = 'disabled';
      this.dideduDataService
        .checkDID(did)
        .pipe(catchError((error1: HttpErrorResponse) => {
          this.disabled = '';
          this.formError = error1.toString();
          return throwError(() => error1);
        }))
        .subscribe((answer1) => {
          this.dideduDataService
            .getAllDIDs()
            .subscribe((answer2) => {
              let alreadyIn = false;
              for (let i = 0; i < answer2.length; i++) {
                if (answer2[i].did === did && answer2[i].title === this.course?.title) {
                  alreadyIn = true;
                  break;
                }
              }
              if (alreadyIn) {
                this.disabled = '';
                this.formError = `The did '${did}' is already in the database!`;
              } else {
                this.dideduDataService
                  .getWalletAcc(environment.WALLET_USERNAME, environment.WALLET_PASSWORD)
                  .pipe(catchError((error3: HttpErrorResponse) => {
                    this.disabled = '';
                    this.formError = error3.toString();
                    return throwError(() => error3);
                  })).subscribe((answer3) => {
                  let credential: Credential[] = [
                    {
                      key: "credentialName",
                      value: this.course?.title + " (Enrollment)",
                    },
                    {
                      key: "userEmail",
                      value: this.user?.email!!
                    },
                    {
                      key: "userId",
                      value: this.user?.id_user.toString()!!
                    },
                    {
                      key: "role",
                      value: this.user?.role!!
                    }
                  ]
                  if (answer3.user) {
                    this.dideduDataService
                      .verifyPresentation(
                        `${this.user?.name}(${this.user?.id_user}) - Course enrollment, Presentation (${this.course?.title})`,
                        this.course?.title!!,
                        answer3.user.didList[0].did,
                        this.currPresentation?.credential!!,
                        this.currPresentation?.batchId!!,
                        credential
                      ).pipe(catchError((error4: HttpErrorResponse) => {
                      this.disabled = '';
                      this.formError = error4.toString();
                      return throwError(() => error4);
                    })).subscribe((answer4) => {
                      if (answer4.message === 'Valid') {
                        //Add in the user's acc
                        this.dideduDataService
                          .enrollStudentToCourse(
                            this.user?.id_user.toString()!!,
                            this.course?.id_course.toString()!!,
                            this.course?.program.id_program.toString()!!
                          ).subscribe((answer5) => {
                          let credential = [
                            {
                              key: "credentialName",
                              value: this.course?.title + " (Enrollment)",
                            },
                            {
                              key: "userEmail",
                              value: this.user?.email
                            },
                            {
                              key: "userId",
                              value: this.user?.id_user
                            },
                            {
                              key: "role",
                              value: this.user?.role
                            }
                          ]

                          this.dideduDataService
                            .issueCredential(
                              answer3.user.username,
                              answer3.user.mnemonic,
                              environment.AUTH_CREDENTIAL_PASSPHRASE,
                              did,
                              credential
                            ).pipe(catchError((error6: HttpErrorResponse) => {
                            this.disabled = '';
                            this.formError = error6.toString();
                            return throwError(() => error6);
                          })).subscribe((answer6) => {
                            //Add in the user's acc
                            this.dideduDataService
                              .addCredentialToAcc(
                                did,
                                this.course?.title!! + " (Enrollment)",
                                answer6.credential,
                                answer6.operationId,
                                answer6.hash,
                                answer6.batchId
                              ).pipe(catchError((error7: HttpErrorResponse) => {
                              this.disabled = '';
                              this.formError = error7.toString();
                              return throwError(() => error7);
                            })).subscribe((answer7) => {
                              this.dideduDataService
                                .addDID(this.user!!.id_user.toString(), did, this.course?.title!!)
                                .pipe(catchError((error8: HttpErrorResponse) => {
                                  this.disabled = '';
                                  this.formError = error8.toString();
                                  return throwError(() => error8);
                                })).subscribe((answer8) => {
                                let newThread = new Thread()
                                newThread.currThread = setInterval(() => this.checkStatus(answer6.operationId, did, answer7._id, answer6.hash), 7000);
                                newThread.currStatus = '';
                                newThread.did = did;
                                this.disabled = '';
                                this.statusThreadArray.push(newThread);
                                this.credentialsEvent.emit();
                                this.cleanModal();
                              });
                            })
                          })
                        })
                      } else {
                        this.disabled = '';
                        this.formError = 'The credential is not valid';
                      }
                    })
                  } else {
                    this.disabled = '';
                    this.formError = 'There was an error sending the enrollment credential! Please try again with another DID!';
                  }
                })
              }
            })
        })
    }
  }

  public addPresentation(presentation: CredentialPresent, index: number) {
    if (this.currPresentation === null) {
      this.currPresentation = presentation
      this.credentials.splice(index, 1);
    }
  }

  public removePresentation(presentation: CredentialPresent) {
    if (this.currPresentation !== null) {
      this.currPresentation = null;
      this.credentials.push(presentation);
    }
  }

  public removeCredential(credential: CredentialPresent, index: number): void {
    if (credential.title === 'DIDEdu-Auth') {
      this.presentationCredential.validAuth = false;
    }
    if (credential.title === `${this.course?.title} (Enrollment)`) {
      this.presentationCredential.validEnroll = false;
    }
    this.presentationCredential.credentials.splice(index, 1);
    this.credentials.push(credential);
  }

  public addCredential(credential: CredentialPresent, index: number): void {
    if (credential.title === 'DIDEdu-Auth') {
      this.presentationCredential.validAuth = true;
    }
    if (credential.title === `${this.course?.title} (Enrollment)`) {
      this.presentationCredential.validEnroll = true;
    }
    this.currCredentialDetails = [];
    this.currIndex = -1;
    this.credentials.splice(index, 1);
    this.presentationCredential.credentials.push(credential);
  }

  public remove(student: Holder, index: number): void {
    this.obligationCredential.holders.splice(index, 1);
    this.course?.students.push(student.user);
  }

  public showAttributes(credential: CredentialPresent, index: number): void {
    this.dideduDataService
      .showCredential(credential)
      .pipe(catchError((error1: HttpErrorResponse) => {
        this.disabled = '';
        this.formError = error1.toString();
        return throwError(() => error1);
      })).subscribe((answer1) => {
        this.currCredentialDetails = answer1.credential;
        this.currIndex = index
        this.credentials[index].chosenAttributes = [];
      });
  }

  public chooseAttributes(data: Credential, event: any): void {
    if (event.target.checked) {
      this.credentials[this.currIndex].chosenAttributes.push(data);
    } else {
      let index = this.credentials[this.currIndex].chosenAttributes.findIndex((credential) => credential.key === data.key)
      this.credentials[this.currIndex].chosenAttributes.splice(index, 1);
    }
  }

  public chooseType(event: any): void {
    this.presentationCredential.type = event.target.value;
    if (this.presentationCredential.type === '2') {
      this.dideduDataService
        .getEnrollmentCourses()
        .subscribe((courses) => {
          this.coursesForEnrollment = courses;
          console.log(this.coursesForEnrollment);
        });
    } else {
      this.coursesForEnrollment = [];
    }
  }

  public chooseEnrollmentCourse(event: any): void {
    this.currCoursePresentations = this.coursesForEnrollment[Number(event.target.value)]
  }

  private cleanModal(): void {
    this.did = '';
    this.obligationsGroup = '';
    this.obligation = '';
    this.formError = '';
    this.obligationCredential.holders = [];
    this.obligationCredential.minVal = 0;
    this.obligationCredential.maxVal = 0;
    this.presentationCredential.validAuth = false;
    this.presentationCredential.validEnroll = false;
    this.presentationCredential.exam = 0;
    this.presentationCredential.type = 0;
    this.presentationCredential.credentials = [];
    this.currCredentialDetails = [];
    this.currIndex = -1;
  }

  private checkStatus = (operationId: string, did: string, idUser: string, credentialHash: string) => {
    let currThread: Thread | null = null;
    let currIndex = -1;
    for (let i = 0; i < this.statusThreadArray.length; i++) {
      if (this.statusThreadArray[i].did === did) {
        currThread = this.statusThreadArray[i];
        currIndex = i;
        break;
      }
    }
    this.dideduDataService
      .checkStatus(operationId)
      .pipe(catchError((error: HttpErrorResponse) => {
        this.formError = error.toString();
        return throwError(() => error);
      })).subscribe((answer) => {
      if (currThread?.currStatus !== answer.status) {
        this.statusThreadArray[currIndex].currStatus = answer.status;
        this.dideduDataService
          .updateStatusVC(idUser, did, credentialHash, answer.status)
          .pipe(catchError((error2: HttpErrorResponse) => {
            this.formError = error2.toString();
            return throwError(() => error2);
          })).subscribe((answer2) => {
          if (answer.status === 'Success' || answer.status === 'Rejected' || answer.status === 'Unknown operation') {
            this.statusThreadArray.splice(currIndex, 1);
            clearInterval(currThread!!.currThread);
          }
        });
      }
    })
  };

  ngOnInit(): void {
    this.cleanModal();
  }

}
