const connection = require('../models/db');

const getAll = (req, res) => {
    connection.query(`SELECT * FROM identity`, (error, identities) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json(identities);
    });
}

const getFilteredByUser = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({ message: "Couldn't find user, idUser is required parameter." });
    }
    if (!req.body.title) {
        return res.status(400).json({ message: "All the data is required." });
    }

    if (req.body.title === 'All') {
        connection.query(`SELECT * FROM identity WHERE user=${idUser}`, (error, identities) => {
            if (error) {
                return res.status(500).json(error);
            }

            res.status(200).json(identities);
        });
    } else {
        connection.query(`SELECT * FROM identity WHERE user=${idUser} AND title='${req.body.title}'`, (error, identities) => {
            if (error) {
                return res.status(500).json(error);
            }

            res.status(200).json(identities);
        });
    }
}

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

    connection.query(`SELECT * FROM identity WHERE did='${req.body.did}' AND title='${req.body.title}'`, (error, identitites) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (identitites[0]) {
            return res.status(404).json({ message: 'The written DID is already in the database!' });
        }

        let identity = [
            req.body.did,
            req.body.title,
            Number(idUser)
        ];

        connection.query('INSERT INTO identity (did, title, user) VALUES (?)', [ identity ], (error, answer) => {
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

const deleteIdentity = (req, res) => {
    let idIdentity = req.params.idIdentity;
    if (!idIdentity) {
        return res.status(404).json({ message: "Couldn't find identity, idIdentity is required parameter." });
    }

    connection.query(`DELETE FROM identity WHERE id_identity='${idIdentity}'`, (error, answer) => {
        if (error) {
            if (error) {
                return res.status(500).json(error);
            }
        }

        res.status(204).json(null);
    })

};

module.exports = {
    getAll,
    getAllByUser,
    addIdentity,
    deleteIdentity,
    getFilteredByUser
}