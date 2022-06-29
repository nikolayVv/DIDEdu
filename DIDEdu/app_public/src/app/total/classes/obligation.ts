export class ObligationsGroup {
  'id_obligations_group': number;
  'title': string;
  'course': number;
  'type': string;
  'obligations': Obligation[];
}

export class Obligation {
  'id_obligation': number;
  'title': string;
  'status': string;
  'created': string;
}
