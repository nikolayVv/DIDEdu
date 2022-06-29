import {User} from "./user";
import {Credential} from "./credential";

export class Holder {
  'user': User;
  'value': number;
  'credential': Credential[]
}

export class HolderIssue {
  'did': string;
  'credential': Credential[]
}
