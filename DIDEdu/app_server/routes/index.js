const express = require('express');
const router = express.Router();
const ctrlMain = require("../controllers/main");
const ctrlAuth = require("../controllers/auth");

/* Home page. */
router.get('/', ctrlMain.index);

/* Universities */
router.get('/auth/universities', ctrlAuth.universities);

module.exports = router;
