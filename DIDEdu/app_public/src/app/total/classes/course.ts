import {Program} from "./program";
import {User} from "./user";

export class Course {
  'id_course': number;
  'title': string;
  'abbreviation': string;
  'program': number;
  'student': number;
  'professor': number;
  'start_date': string;
  'end_date': string;
}

export class CourseDetails {
  'id_course': number;
  'title': string;
  'abbreviation': string;
  'about': string;
  'program': Program;
  'students': User[];
  'professors': User[];
  'start_date': string;
  'end_date': string;
}
