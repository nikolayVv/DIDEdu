# DIDEdu

DIDEdu is an open code decentralized solution, which is developed to present the advantages of implementing Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) in a system. [Decentralized Identifiers](https://www.w3.org/TR/did-core/) are a new type of identifiers, that enable a verifiable, distributed digital identity. With the help of this technology, DIDEdu offers to its users:
- Issuing of credentials for completed obligations (exams, exercises, lectures, assignments, etc.), subjects, years and programs;
- Authentication/Registration for individual activities (exams, colloquiums, tests, etc.) using credentials or presentations;
- Signing in the website only with a DID;
- Secured data storage;
- Easy to use and user friendly interface;
- Cheaper usage of the Blockchain using Batches;

The main logic is in the DID service, which is developed in Kotlin and is using the Atala PRISM SDK. Atala PRISM SDK is a development kit, which is following the W3C standard and is working on the Cardano Blockchain. It allows developers to use already implemented functionalities, which helps them develop solutions, that are using DIDs and VCs.

## Usage

https://user-images.githubusercontent.com/61247744/187813639-f10956c1-b78e-4311-9770-d488d0e355fe.mp4

The following video (presentation) shows the main decentralized identifiers' functionalities, that DIDEdu is implementing.
- Generating DID
- Verifying batch/credential
- Issuing batch/credential
- Generating verifiable presentation
- Revocation

## Installation
Before starting the installation, please make sure you have cloned (pulled) the repository.
```bash
git clone git@github.com:nikolayVv/DIDEdu.git
```
### Configuration
The first thing you have to do is to add a system environment variable with the name "PRISM_SDK_PASSWORD". This will allow the DID service to access the libraries that Atala PRISM SDK is offerring. To get this password, you must become part of the Atala PRISM developers' community by joining the [Atala PRISM Pioneer Program](https://input-output.typeform.com/to/xfSQykYo?typeform-source=atalaprism.io).
After that is done you have to build the gradle file in the DID service. This can be done authomatic by using a development environment like [IntelliJ](https://www.jetbrains.com/idea/). You will also need to install the libraries needed for the DIDEdu webpage. Make sure you have npm installed!
```bash
cd DIDEdu
npm install
cd app_public
npm install
```
### Running
Now after all libraries are installed, it's time to start the systems. First start the DID service, by running the "DidServiceApplication.kt" file in the development environment. After that you will need to import the digital wallet in your Chrome browser by opening the extensions tab, switching to Developers mode and loading the folder "digitalWallet". When this is done on different terminals run:
- digital wallet server,
```bash
cd digitalWallet
cd app_server
npm run start
```
- DIDEdu server and
```bash
cd DIDEdu
npm run start
```
- DIDEdu webpage
```bash
cd DIDEdu
cd app_public
ng serve --open
```
After the last terminal loads, the website must show in a new tab, in your browser. If it doesn't load and everything is running without errors, you can find the webpage on localhost:4200.

## Contributing
Pull requests are welcome! For changes, please fork the repository!

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements
This solution is developed as part of my thesis for receiving a bachelor's degree from the [University of Ljubljana Faculty of Computer and Information Science](https://www.fri.uni-lj.si/en). I would like to give very special thanks to:
- my mentor, [prof. Dejan Lavbič](https://www.lavbic.net/), who came up with the theme of the thesis and helped me write it and develop a solution for it;
- the [Atala PRISM](https://atalaprism.io/) team and the [IOG's Technical Community](https://iohk.io/) for giving me a spot in the first Pioneer program, where I learned, how to work with the Atala PRISM SDK, and for their help through the developing process;
