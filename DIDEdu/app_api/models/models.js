const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const dataSchema = new mongoose.Schema({
    array: { type: [Number], required: true }
});

const obligationsGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    obligations: { type: [String], default: [] }
});

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    abbreviation: { type: String, default: "" },
    semester: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    about: { type: String, required: true },
    obligationsGroups: { type: [obligationsGroupSchema], default: [] }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    hashValue: { type: String, required: true },
    randomValue: {type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    dids: { type: [String], default: [] },
    courses: { type: [courseSchema], default: [] },
});

userSchema.methods.setPassword = function (password) {
    this.randomValue = crypto.randomBytes(16).toString("hex");
    this.hashValue = crypto.pbkdf2Sync(password, this.randomValue, 1000, 64, "sha512").toString("hex");
};

userSchema.methods.checkPassword = function (password) {
    let hashValue = crypto.pbkdf2Sync(password, this.randomValue, 1000, 64, "sha512").toString("hex");
    return this.hashValue === hashValue;
}

userSchema.methods.generateJwt = function () {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 1);

    //TODO add public key to the token or maybe DID?
    return jwt.sign(
        {
            email: this.email,
            name: this.name + " " + this.surname,
            role: this.title,
            exp: parseInt(validUntil.getTime() / 1000)
        },
        process.env.JWT_PASSWORD
    )
}

const degreeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true },
});

const programSchema = new mongoose.Schema({
    name: { type: String, required: true },
    degrees: { type: [degreeSchema], default: [] },
    students: { type: [userSchema], default: [] },
    professors: { type: [userSchema], default: [] },
});

const facultySchema = new mongoose.Schema({
    title: { type: String, required: true },
    abbreviation: { type: String, default: "" },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    programs: { type: [programSchema], default: [] },
    controllers: {type: [userSchema], default: [] }
});

const universitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    abbreviation: { type: String, default: "" },
    country: { type: String, required: true },
    city: { type: String, required: true },
    faculties: { type: [facultySchema], default: [] },
    controller: { type: userSchema, default: null }
});

mongoose.model('User', userSchema, 'Users');
mongoose.model('University', universitySchema, 'Universities');
mongoose.model('Faculty', facultySchema, 'Faculties');
mongoose.model('Program', programSchema, 'Programs');
mongoose.model('Course', courseSchema, 'Courses');

//TODO how can I add another private key (studentId, professorId, courseId)
//TODO can one user have more public keys (more DIDs) -> what will that change for the revocation
//TODO who can give you diplom (university or faculty)
//TODO do I need more profiles for single faculty profile
//TODO admin(me) will be able to login only by his wallet

//TODO unique titleUni, titleFaks, email,