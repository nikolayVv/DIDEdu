const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const connection = require('../models/db');

const register = (req, res) => {
    if (!req.body.name || !req.body.surname || !req.body.email || !req.body.role || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }
    let { randomValue, hashValue } = setPassword(req.body.password);
    let user = [
        req.body.name,
        req.body.surname,
        req.body.email,
        req.body.role,
        hashValue,
        randomValue,
        new Date(Date.now())
    ];

    connection.query('INSERT INTO user (name, surname, email, role, hashValue, randomValue, registration_date) VALUES (?)', [ user ], (error, answer) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json({
            message: `New user (${req.body.role}) was successfully created!`,
            answer: answer
        });
    });
}

const addUniversityController = (req, res) => {
    if (!req.body.name || !req.body.surname || !req.body.email || !req.body.password || !req.body.idUniversity) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM university WHERE id_university='${req.body.idUniversity}'`, (error, universities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!universities[0]) {
            return res.status(404).json({ message: "Couldn't find university with the given ID." })
        }

        let { randomValue, hashValue } = setPassword(req.body.password);
        let user = [
            req.body.name,
            req.body.surname,
            req.body.email,
            "universityController",
            hashValue,
            randomValue,
            new Date(Date.now())
        ];

        connection.query('INSERT INTO user (name, surname, email, role, hashValue, randomValue, registration_date) VALUES (?)', [ user ], (error, answerUser) => {
            if (error) {
                return res.status(500).json(error);
            }
            let controller = [
                answerUser.insertId,
                Number(req.body.idUniversity)
            ];

            connection.query('INSERT INTO university_controller (user, university) VALUES (?)', [ controller ], (error, answerController) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.status(200).json({
                    message: `New user (university controller) was successfully created!`,
                    answer: answerController
                });
            });
        });
    });
};

const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM user WHERE email='${req.body.email}'`, (error, user) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!user[0]) {
            return res.status(401).json({ message: "Wrong credentials! Please try again." })
        }
        if (!checkPassword(req.body.password, user[0].randomValue, user[0].hashValue)) {
            return res.status(401).json({ message: "Wrong credentials! Please try again." })
        }
        res.status(200).json({ token: generateJwt(user[0]) });
    });
};

const changePassword = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({
            message: "Couldn't find student, idStudent is required parameter."
        });
    }
    if (!req.body.password || !req.body.oldPassword) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM user WHERE id_user='${idUser}'`, (error, user) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!user[0]) {
            return res.status(404).json({ message: "Couldn't find user with the given ID." })
        }
        if (!checkPassword(req.body.oldPassword, user[0].randomValue, user[0].hashValue)) {
            return res.status(404).json({ message: "Wrong password! Please try again." })
        }
        let { randomValue, hashValue } = setPassword(req.body.password);
        connection.query(`UPDATE user SET hashValue='${hashValue}', randomValue='${randomValue}' WHERE id_user='${idUser}'`, (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json({
                message: `Password was successfully changed!`,
                answer: answer
            });
        });
    });
};

const setPassword = function (password) {
    let randomValue = crypto.randomBytes(16).toString("hex");
    let hashValue = crypto.pbkdf2Sync(password, randomValue, 1000, 64, "sha512").toString("hex");
    return { randomValue, hashValue };
};

const checkPassword = function (password, randomValue, hashValue) {
    let hashValueNew = crypto.pbkdf2Sync(password, randomValue, 1000, 64, "sha512").toString("hex");
    return hashValue === hashValueNew;
};

const generateJwt = function (user) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 1);

    //TODO add public key to the token or maybe DID?
    return jwt.sign(
        {
            id_user: user.id_user,
            email: user.email,
            name: user.name + " " + user.surname,
            role: user.role,
            hasDid: user.has_did,
            exp: parseInt(validUntil.getTime() / 1000)
        },
        process.env.JWT_PASSWORD
    )
};

module.exports = {
    login,
    register,
    changePassword,
    addUniversityController
}