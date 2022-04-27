const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    array: { type: [Number], required: true}
});

const publicKeySchema = new mongoose.Schema({
    curve: { type: String, required: true },
    data: { type: dataSchema, required: true },
    unknownFields: {type: Object, required: true}
});

const obligationsGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    obligations: { type: [String], default: []}
});

const courseSchema = new mongoose.Schema({
    courseId: { type: String, unique: true, required: true },
    name: { type: String, required: true},
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    about: { type: String, required: true },
    obligationsGroups: { type: [obligationsGroupSchema], default: null }
});

const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true},
    email: { type: String, unique: true, required: true },
    hashValue: { type: String, required: true },
    randomValue: {type: String, required: true },
    registered: { type: Date, default: Date.now },
    publicKey: { type: [publicKeySchema], default: null},
    enrolledCourses: { type: [courseSchema], default: [] }
});

const professorSchema = new mongoose.Schema({
    professorId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    title: { type: [String], required: true },
    email: { type: String, unique: true, required: true },
    hashValue: { type: String, required: true },
    randomValue: {type: String, required: true },
    registered: { type: Date, default: Date.now },
    publicKey: { type: [publicKeySchema], default: null },
    courses: { type: [courseSchema], default: [] }
});

const programSchema = new mongoose.Schema({
    name: { type: String, required: true },
    degree: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    students: { type: [studentSchema], default: [] },
    professors: { type: [professorSchema], default: [] },
})

const facultyAdminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    hashValue: { type: String, required: true },
    randomValue: { type: String, required: true },
    publicKey: { type: [publicKeySchema], default: null },
});

const facultySchema = new mongoose.Schema({
    title: { type: String, required: true },
    abbreviation: { type: String, default: "" },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    administrators: { type: [facultyAdminSchema], required: true},
    programs: { type: [programSchema], default: [] }
});

const universitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    abbreviation: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    hashValue: { type: String, required: true },
    randomValue: {type: String, required: true },
    faculties: { type: [facultySchema], default: [] },
});

mongoose.model('Course', courseSchema, 'Courses')
mongoose.model('Student', studentSchema, 'Students');
mongoose.model('Professor', professorSchema, 'Professors');
mongoose.model('Faculty', facultySchema, 'Faculties')
mongoose.model('University', universitySchema, 'Universities');

//TODO how can I add another private key (studentId, professorId, courseId)
//TODO can one user have more public keys (more DIDs)
//TODO who can give you diplom (university or faculty) -> publicKey
//TODO do I need more profiles for single faculty profile
//TODO admin(me) will be able to login only by his wallet
