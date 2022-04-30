const express = require("express");
const router = express.Router();

const jwt = require("express-jwt").expressjwt;
const authentication = jwt({
   secret: process.env.JWT_PASSWORD,
   userProperty: "payload",
   algorithms: ["HS256"]
});

const ctrlUsers = require('../controllers/users');
const ctrlAuthentication = require('../controllers/authentication');
const ctrlUniversities = require('../controllers/universities');
const ctrlFaculties = require('../controllers/faculties');
const ctrlPrograms = require('../controllers/programs');
const ctrlDegrees = require('../controllers/degrees');

/* Authentication */
router.post("/register", authentication, ctrlAuthentication.register);
router.post("/login", ctrlAuthentication.login);


/* Users */
router.get("/users", ctrlUsers.getAllUsers);
router
    .route('/users/:idUser')
    .get(ctrlUsers.getUserById)
    .delete(authentication, ctrlUsers.deleteUser);
router
    .route("/universities/:idUniversity/controller")
    .get(ctrlUsers.getUniversityController)
    .post(ctrlUsers.addUniversityController);
router
    .route("/faculties/:idFaculty/controllers")
    .get(ctrlUsers.getFacultyControllers)
    .post(ctrlUsers.addFacultyController)

/* Universities */
router
    .route("/universities")
    .get(ctrlUniversities.getAllUniversities)
    .post(ctrlUniversities.addUniversity);

/* Faculties */
router.get("/faculties", ctrlFaculties.getAllFaculties)
router
    .route("/universities/:idUniversity/faculties")
    .get(ctrlFaculties.getAllUniversityFaculties)
    .post(ctrlFaculties.addUniversityFaculty)

/* Programs */
router
    .route("/faculties/:idFaculty/programs")
    .get(ctrlPrograms.getAllFacultyPrograms)
    .post(ctrlPrograms.addFacultyProgram)

/* Degrees */
router
    .route("/programs/:idProgram/degrees")
    .get(ctrlDegrees.getAllProgramDegrees)
    .post(ctrlDegrees.addProgramDegree)

module.exports = router;