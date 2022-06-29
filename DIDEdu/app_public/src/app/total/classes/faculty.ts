import {Program} from "./program";
import {User} from "./user";

export class Faculty {
  "id_faculty": number;
  "title": string;
  "abbreviation": string;
  "country": string;
  "city": string;
  "contactNumber": string;
  "programs": Program[];
  "controllers": User[];
}

