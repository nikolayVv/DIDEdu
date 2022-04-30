var apiParameters = {
    server: "http://localhost:" + (process.env.PORT || 3000)
};
if (process.env.NODE_ENV === "production") {
    apiParameters.server = "https://didedu.herokuapp.com/";
}
const axios = require('axios').create({
    baseURL: apiParameters.server,
    timeout: 5000
});

const universities = (req, res) => {
    axios.get('/api/universities').then((answer) => {
        showUniversities(req, res, answer.data.universities);
    });
};

const showUniversities = (req, res, universities) => {
    res.render("loginUniversity", {
        title: "DIDEdu-Login",
        nav: {
           isVisible: false
        },
        universities: {
            label: `<label for="chooseUniversity" class="form-label"><b>Name of university</b></label>`,
            body: `<input class="form-control" list="universities" id="chooseUniversity" placeholder="Type to search..." onchange="check(this, 'list');">`,
            error: `<div class="invalid-feedback">This field is required</div>`,
            data: universities
        },
        faculties: {
            label: `<label for="chooseFaculty" class="form-label"><b>Name of faculty</b></label>`,
            body: `<input class="form-control" list="faculties" id="chooseFaculty" placeholder="Type to search..." onchange="check(this, 'button');">`,
            error: `<div class="invalid-feedback">This field is required</div>`,
            data: universities[0].faculties
        },
        bonusScripts: `<script src="../javascripts/loginUniversity.js" type="application/javascript"></script>`,
    });
}

module.exports = {
    universities
}