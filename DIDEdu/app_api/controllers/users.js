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

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser
};