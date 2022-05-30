// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiUrl: 'http://localhost:3000/api',
  didUrl: 'http://localhost:8080/did',
  walletUrl: 'http://localhost:8000/wallet',
  WALLET_USERNAME: 'DIDEdu123',
  WALLET_PASSWORD: 'Assasin2000!!!',
  AUTH_CREDENTIAL_NAME: 'DIDEdu-Auth',
  AUTH_CREDENTIAL_PASSPHRASE: 'DIDEdu-Authentication',
  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
