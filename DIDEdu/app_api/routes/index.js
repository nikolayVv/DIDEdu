const express = require("express");
const router = express.Router();

const jwt = require("express-jwt").expressjwt;
const authentication = jwt({
   secret: process.env.JWT_PASSWORD,
   userProperty: "payload",
   algorithms: ["HS256"]
});

const ctrlAuthentication = require('../controllers/authentication');
const ctrlUniversities = require('../controllers/universities');
const ctrlIdentities = require('../controllers/identities');
const ctrlUsers = require('../controllers/users');
const ctrlFaculties = require('../controllers/faculties');
const ctrlCourses = require('../controllers/courses');
const ctrlObligations = require('../controllers/obligations');

/* Authentication */
router.post("/login", ctrlAuthentication.login);
router.post("/register", ctrlAuthentication.register);

/* Universities */
router
    .route("/universities")
    .get(ctrlUniversities.getAllUniversities)
    .post(ctrlUniversities.createUniversity)
router
    .route("/universities/:idUniversity")
    .get(ctrlUniversities.getUniversityById)
router.post("/universities/filter", ctrlUniversities.getUniversitiesFiltered)
router.get("/universities/controlledBy/:idUser", ctrlUniversities.getControlledUniversity)

/* Faculties */
router
    .route("/faculties")
    .get(ctrlFaculties.getAllFaculties)
    .post(ctrlFaculties.createFaculty);
router.post("/faculties/filter", ctrlFaculties.getFacultiesFiltered);

/* Courses */
router
    .route("/students/:idStudent/courses")
    .get(ctrlCourses.getStudentCourses);
router
    .route("/professors/:idProfessor/courses")
    .get(ctrlCourses.getProfessorCourses);
router
    .route("/courses/:idCourse")
    .get(ctrlCourses.getCourseDetails)

/* Users */
router
    .route("/universities/controllers")
    .post(ctrlAuthentication.addUniversityController)
router.post("/users/did", ctrlUsers.getUserByDID)

/* Obligations */
router.put("/obligations/:idObligation", ctrlObligations.changeObligationStatus)
router
    .route("/obligations/:idCourse/groups")
    .get(ctrlObligations.getAllObligationsGroupsByCourse)
    .post(ctrlObligations.addObligationsGroup)
router
    .route("/obligations/:idObligationsGroup")
    .post(ctrlObligations.addObligation)

/* Identities */
router.get("/identities", ctrlIdentities.getAll);
router.post("/users/:idUser/identities/filter", ctrlIdentities.getFilteredByUser);
router
    .route("/users/:idUser/identities")
    .get(ctrlIdentities.getAllByUser)
    .post(ctrlIdentities.addIdentity);
router.delete("/identities/:idIdentity", ctrlIdentities.deleteIdentity)

// router.get('/users',ctrlUsers.getAllUsers);
// router
//     .route('/users/:idUser')
//     .get(ctrlUsers.getUserById)
//     .put(ctrlAuthentication.changePassword)
//     .delete(ctrlUsers.deleteUser)
//
// /* Cities */
// router
//     .route('/cities')
//     .get(ctrlCities.getAllCities)
//     .post(ctrlCities.addCity);
//
// router
//     .route('/cities/:zip')
//     .get(ctrlCities.getCityByZip)
//     .put(ctrlCities.editZip)
//     .delete(ctrlCities.deleteZip);
//
// router
//     .route('/cities/:cityName/zips')
//     .get(ctrlCities.getZipsByCityName)
//     .put(ctrlCities.editCity)
//     .delete(ctrlCities.deleteCity);

module.exports = router;