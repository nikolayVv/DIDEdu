export class University {
  "id_university": number;
  "title": string;
  "abbreviation": string;
  "country": string;
  "city": string;
  "faculties": uniFaculty[];
  "controllers": number;
}

class uniFaculty {
  "id_faculty": number;
  "title": string;
  "abbreviation": string;
}
