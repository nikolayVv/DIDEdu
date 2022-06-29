const connection = require('../models/db');

const getProfessorCourses = (req, res) => {
    let idProfessor = req.params.idProfessor;
    if (!idProfessor) {
        return res.status(404).json({ message: "Couldn't find professor, idProfessor is required parameter." });
    }

    connection.query(`SELECT * FROM professor WHERE user='${idProfessor}'`, (error, professors) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!professors[0]) {
            return res.status(404).json({ message: "Couldn't find professor with the given ID." })
        }

        connection.query(`SELECT * FROM course WHERE id_course='${professors[0].course}'`, (error, courses) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (courses.length === 0) {
                return res.status(404).json({ message: `You don't have any courses in the database yet.` })
            }

            res.status(200).json(courses);
        });
    });
};

const getStudentCourses = (req, res) => {
    let idStudent = req.params.idStudent;
    if (!idStudent) {
        return res.status(404).json({ message: "Couldn't find student, idStudent is required parameter." });
    }

    connection.query(`SELECT * FROM student WHERE user='${idStudent}'`, (error, students) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!students[0]) {
            return res.status(404).json({ message: "Couldn't find student with the given ID." })
        }

        connection.query(`SELECT * FROM course WHERE id_course='${students[0].course}'`, (error, courses) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (courses.length === 0) {
                return res.status(404).json({ message: `You don't have any courses in the database yet.` })
            }

            res.status(200).json(courses);
        });
    });
};

const getCourseDetails = (req, res) => {
    let idCourse = req.params.idCourse;
    if (!idCourse) {
        return res.status(404).json({ message: "Couldn't find course, idCourse is required parameter." });
    }

    connection.query(`SELECT * FROM course WHERE id_course='${idCourse}'`, (error, courses) => {
         if (error) {
            return res.status(500).json(error);
         }
         if (!courses[0]) {
            return res.status(404).json({ message: "Couldn't find course with the given ID." })
         }

         connection.query(`SELECT * FROM professor WHERE course='${idCourse}'`, (error, professors) => {
             if (error) {
                 return res.status(500).json(error);
             }
             if (!professors[0]) {
                 return res.status(404).json({ message: "Couldn't fetch the professors." })
             }

             connection.query(`SELECT * FROM student WHERE course='${idCourse}'`, (error, students) => {
                 if (error) {
                     return res.status(500).json(error);
                 }
                 if (!students[0]) {
                     return res.status(404).json({ message: "Couldn't fetch the student." })
                 }

                 connection.query(`SELECT * FROM program WHERE id_program='${courses[0].program}'`, (error, programs) => {
                     if (error) {
                         return res.status(500).json(error);
                     }
                     if (!programs[0]) {
                         return res.status(404).json({ message: "Couldn't fetch the program." })
                     }

                     let professorsIds = [];
                     professors.forEach(professor => {
                         professorsIds.push(professor.user);
                     });
                     connection.query(`SELECT * FROM user WHERE id_user IN (${professorsIds.join()})`, (error, userProfessors) => {
                         if (error) {
                             return res.status(500).json(error);
                         }

                         let studentsIds = [];
                         students.forEach(student => {
                             studentsIds.push(student.user);
                         });
                         connection.query(`SELECT * FROM user WHERE id_user IN (${studentsIds.join()})`, (error, userStudents) => {
                             if (error) {
                                 return res.status(500).json(error);
                             }

                             userStudents.forEach(user => {
                                 user.name = user.name + " " + user.surname;
                             })

                             connection.query(`SELECT * FROM identity WHERE title='${courses[0].title}'`, (error, identities) => {
                                 if (error) {
                                     return res.status(500).json(error);
                                 }

                                 let found = false;
                                 for (let i = 0; i < identities.length; i++) {
                                     found = false;
                                     for (let j = 0; j < userProfessors.length; j++) {
                                         if (!userProfessors[j].did) {
                                             userProfessors[j].did = '';
                                         }
                                         if (userProfessors[j].id_user === identities[i].user) {
                                             found = true;
                                             userProfessors[j].did = identities[i].did;
                                             break;
                                         }
                                     }
                                     if (!found) {
                                         for (let j = 0; j < userStudents.length; j++) {
                                             if (!userStudents[j].did) {
                                                 userStudents[j].did = '';
                                             }
                                             if (userStudents[j].id_user === identities[i].user) {
                                                 userStudents[j].did = identities[i].did;
                                                 break;
                                             }
                                         }
                                     }
                                 }

                                 let result = {
                                     id_course: courses[0].id_course,
                                     title: courses[0].title,
                                     abbreviation: courses[0].abbreviation,
                                     about: courses[0].about,
                                     program: programs[0],
                                     students: userStudents,
                                     professors: userProfessors,
                                     start_date: courses[0].start_date,
                                     end_date: courses[0].end_date
                                 }

                                 res.status(200).json(result);
                             });
                         });
                     });
                 });
             });
         });
    });
}

module.exports = {
    getProfessorCourses,
    getStudentCourses,
    getCourseDetails
};
