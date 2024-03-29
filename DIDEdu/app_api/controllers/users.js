const connection = require('../models/db');

const getAllUsers = (req, res) => {
    connection.query('SELECT * FROM user', (error, users) => {
       if (error) {
           return res.status(500).json(error);
       }
       if (users && users.length === 0) {
           return res.status(404).json({ message: "There are no users in the database yet." });
       }
       res.status(200).json(users);
    });
};

const getUserById = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({
            message: "Couldn't find user, idUser is required parameter."
        });
    }

    connection.query(`SELECT * FROM user WHERE id_user='${idUser}'`, (error, user) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!user[0]) {
            return res.status(404).json({ message: "Couldn't find user with the given ID." })
        }
        res.status(200).json(user[0]);
    });
};

const deleteUser = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({
            message: "Couldn't find student, idStudent is required parameter."
        });
    }

    //TODO => revoke credentials and identities + delete identities in the db
    connection.query(`SELECT * FROM user WHERE id_user='${idUser}'`, (error, user) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!user[0]) {
            return res.status(404).json({message: "Couldn't find user with the given ID."})
        }

        connection.query(`DELETE FROM user WHERE id_user='${idUser}'`, (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(201).json(null);
        });
    });
};

const getUserByDID = (req, res) => {
    if (!req.body.did) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM identity WHERE did='${req.body.did}'`, (error, identities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!identities[0]) {
            return res.status(404).json({message: "Couldn't find identity with the given DID."})
        }

        connection.query(`SELECT * FROM user WHERE id_user='${identities[0].user}'`, (error, users) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (!users[0]) {
                return res.status(404).json({message: "Couldn't find user with the given ID."})
            }

            res.status(200).json(users[0]);
        });
    })
};

const getStudentsByCourse = (req, res) => {
    let idCourse = req.params.idCourse;
    if (!idCourse) {
        return res.status(404).json({ message: "Couldn't find course, idCourse is required parameter." });
    }

    connection.query(`SELECT * FROM course WHERE id_course='${idCourse}'`, (error, courses) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!courses[0]) {
            return res.status(404).json({message: "Couldn't find course with the given ID."})
        }

        connection.query(`SELECT user FROM student WHERE course='${idCourse}'`, (error, students) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (students.length === 0) {
                return res.status(404).json({ message: `No students found for course '${courses[0].title}'.` });
            }

            let ids = [];
            students.forEach(student => {
                ids.push(student.user);
            });

            connection.query(`SELECT * FROM user WHERE id_user IN (${ids.join()})`, (error, users) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.status(200).json(users);
            });
        })
    });
}

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    getUserByDID,
    getStudentsByCourse
};