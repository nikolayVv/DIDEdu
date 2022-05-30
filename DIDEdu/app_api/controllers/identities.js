const connection = require('../models/db');


const getAllByUser = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({ message: "Couldn't find user, idUser is required parameter." });
    }

    connection.query(`SELECT * FROM identity WHERE user=${idUser}`, (error, identities) => {
       if (error) {
           return res.status(500).json(error);
       }
       res.status(200).json(identities);
    });
};

const addIdentity = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({ message: "Couldn't find user, idUser is required parameter." });
    }
    if (!req.body.did) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM identity WHERE did='${req.body.did}'`, (error, identitites) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (identitites[0]) {
            return res.status(404).json({ message: 'The written DID is already in the database!' });
        }

        let identity = [
            req.body.did,
            Number(idUser)
        ];

        connection.query('INSERT INTO identity (did, user) VALUES (?)', [ identity ], (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }

            connection.query(`UPDATE user SET has_did='1' WHERE id_user='${idUser}'`, (error, answer) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.status(200).json({
                    message: "DID successfully added to the database",
                    answer: answer
                });
            });
        });
    });
};

module.exports = {
    getAllByUser,
    addIdentity
}