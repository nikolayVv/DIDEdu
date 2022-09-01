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

            let isEnrolled = false;
            let result = [];
            courses.forEach(course => {
                isEnrolled = false;
                for (let i = 0; i < professors.length; i++) {
                    if (professors[i].course === course.id_course) {
                        isEnrolled = true;
                        professors.splice(i, 1);
                        break;
                    }
                }

                result.push({
                    id_course: course.id_course,
                    title: course.title,
                    abbreviation: course.abbreviation,
                    start_date: course.start_date,
                    end_date: course.end_date,
                    presentation_needed: course.presentation_needed,
                    is_enrolled: isEnrolled
                });
            });

            res.status(200).json(result);
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

        connection.query(`SELECT * FROM course`, (error, courses) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (courses.length === 0) {
                return res.status(404).json({ message: `You don't have any courses in the database yet.` })
            }

            let isEnrolled = false;
            let result = [];
            courses.forEach(course => {
                isEnrolled = false;
                for (let i = 0; i < students.length; i++) {
                    if (students[i].course === course.id_course) {
                        isEnrolled = true;
                        students.splice(i, 1);
                        break;
                    }
                }

                result.push({
                    id_course: course.id_course,
                    title: course.title,
                    abbreviation: course.abbreviation,
                    start_date: course.start_date,
                    end_date: course.end_date,
                    presentation_needed: course.presentation_needed,
                    is_enrolled: isEnrolled
                });
            });

            res.status(200).json(result);
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

const getEnrollmentCourses = (req, res) => {
    connection.query("SELECT * FROM course WHERE presentation_needed='1'", (error, courses) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (courses.length === 0) {
            return res.status(404).json({ message: "Couldn't find any courses for enrollment." });
        }

        let ids = [];
        courses.forEach((course) => {
            ids.push(course.id_course);
        })

        connection.query(`SELECT p.course, n.obligation_title, n.obligations_group_title, n.course_title FROM presentation AS p INNER JOIN (SELECT o.id_obligation, o.title AS obligation_title, ng.obligations_group_title, ng.course_title FROM obligation AS o INNER JOIN (SELECT og.id_obligations_group, og.title AS obligations_group_title, c.title AS course_title FROM obligations_group AS og INNER JOIN course AS c ON (og.course=c.id_course)) AS ng ON (o.obligations_group=ng.id_obligations_group)) AS n ON (p.obligation=n.id_obligation) WHERE p.course IN (${ids})`, (error, presentations) => {
            if (error) {
                return res.status(500).json(error);
            }

            let result = [];
            courses.forEach((course) => {
                let newCourse = {
                    id_course: course.id_course,
                    title: course.title,
                    abbreviation: course.abbreviation,
                    start_date: course.start_date,
                    end_date: course.end_date,
                    presentation_needed: course.presentation_needed,
                    presentations: []
                }
                presentations.forEach((presentation) => {
                   if (presentation.course === course.id_course) {
                       newCourse.presentations.push(`${presentation.course_title} (${presentation.obligation_title} - ${presentation.obligations_group_title})`);
                   }
                })

                result.push(newCourse);
            });

            res.status(200).json(result);
        });
    })
};

const enrollStudent = (req, res) => {
    let idStudent = req.params.idStudent;
    let idCourse = req.params.idCourse;
    if (!idStudent || !idCourse) {
        return res.status(404).json({ message: "Couldn't find student or course, idStudent and idCourse are required parameters." });
    }

    connection.query(`SELECT * FROM course WHERE id_course='${idCourse}'`, (error, courses) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!courses[0]) {
            return res.status(404).json({ message: "Couldn't find course with the given ID." })
        }

        connection.query(`SELECT * FROM user WHERE id_user='${idStudent}'`, (error, students) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (!students[0]) {
                return res.status(404).json({message: "Couldn't find student with the given ID."})
            }

            let newStudent = [
                idStudent,
                req.body.program,
                idCourse
            ];

            connection.query('INSERT INTO student (user, program, course) VALUES (?)', [ newStudent ], (error, answer) => {
                if (error) {
                    return res.status(500).json(error);
                }
                res.status(200).json({
                    message: `The student was successfully enrolled to the course.`,
                    answer: answer
                });
            });
        });
    });
};

module.exports = {
    getProfessorCourses,
    getStudentCourses,
    getCourseDetails,
    getEnrollmentCourses,
    enrollStudent
};
