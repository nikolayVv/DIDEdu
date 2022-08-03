export class Credential {
  'key': string;
  'value': string;
}

export class CredentialPresent {
  'title': string;
  'credential': string;
  'did': string;
  'batchId': string;
  'chosenAttributes': Credential[]
}
