import {Program} from "./program";
import {User} from "./user";
import {Obligation} from "./obligation";

export class Course {
  'id_course': number;
  'title': string;
  'abbreviation': string;
  'start_date': string;
  'end_date': string;
  'presentation_needed': boolean;
  'is_enrolled': boolean;
  'presentations': string[];
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
