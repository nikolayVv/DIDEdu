const connection = require('../models/db');

const getAllFaculties = (req, res) => {
    connection.query(`SELECT * FROM faculty`, (error, faculties) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (faculties.length === 0) {
            return res.status(404).json({ message: `There are no faculties in the database yet.` })
        }

        res.status(200).json(faculties);
    });
};

const getFacultiesFiltered = (req, res) => {
    if (!req.body.value) {
        getAllFaculties(req, res);
    } else {
        connection.query(`SELECT * FROM faculty WHERE title LIKE '%${req.body.value}%'`, (error, faculties) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (faculties.length === 0) {
                return res.status(404).json({ message: `No faculties found with name '${req.body.value}'.` });
            }

            res.status(200).json(faculties);
        });
    }
};

const createFaculty = (req, res) => {
    if (!req.body.faculty.title || !req.body.faculty.country || !req.body.faculty.city || !req.body.faculty.zip || !req.body.faculty.street || !req.body.faculty.houseNumber) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM faculty WHERE title='${req.body.faculty.title}'`, (error, faculties) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (faculties[0]) {
            return res.status(404).json({ message: `The faculty '${faculties[0].title}' is already in the database.` })
        }

        connection.query(`SELECT * FROM city WHERE zip='${req.body.faculty.zip}' AND name='${req.body.faculty.city}'`, (error, cities) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (!cities[0]) {
                return res.status(404).json({ message: `Couldn't find a city '${req.body.faculty.city}' with the zip '${req.body.faculty.zip}'.` })
            }
            connection.query(`SELECT * FROM country WHERE city='${cities[0].zip}' AND name='${req.body.faculty.country}'`, (error, countries) => {
                if (error) {
                    return res.status(500).json(error);
                }
                if (!countries[0]) {
                    return res.status(404).json({ message: `Couldn't find a country '${req.body.faculty.country}' with city '${req.body.faculty.city}' and zip '${req.body.faculty.zip}'.` })
                }

                connection.query(`SELECT * FROM address WHERE street='${req.body.faculty.street}' AND house_number='${req.body.faculty.houseNumber}' AND country='${countries[0].id_country}'`, (error, addresses) => {
                    if (error) {
                        return res.status(500).json(error);
                    }
                    if (addresses[0]) {
                        return res.status(409).json({ message: "The chosen address is already taken. Please change it and try again." });
                    }

                    let newAddress = [
                        req.body.faculty.street,
                        req.body.faculty.houseNumber,
                        countries[0].id_country
                    ];
                    connection.query('INSERT INTO address (street, house_number, country) VALUES (?)', [ newAddress ], (error, answer) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        let newFaculty = [
                            req.body.faculty.title,
                            req.body.faculty.abbreviation ? req.body.faculty.abbreviation : "",
                            answer.insertId,
                            req.body.faculty.university
                        ];
                        connection.query('INSERT INTO faculty (title, abbreviation, address, university) VALUES (?)', [ newFaculty ], (error, answer2) => {
                            if (error) {
                                return res.status(500).json(error);
                            }

                            if (req.body.programs.length > 0) {
                                let newPrograms = [];
                                req.body.programs.forEach(program => {
                                    let newProgram = [
                                        program.title,
                                        program.bachelorDegreeYears,
                                        program.masterDegreeYears,
                                        program.doctorDegreeYears,
                                        answer2.insertId
                                    ];

                                    newPrograms.push(newProgram);
                                });
                                connection.query('INSERT INTO program (title, bachelorDegreeYears, masterDegreeYears, doctorDegreeYears, faculty) VALUES (?)', newPrograms, (error, answer3) => {
                                    if (error) {
                                        return res.status(500).json(error);
                                    }

                                    res.status(200).json({
                                        message: `The faculty '${req.body.faculty.title}' was added successfully in the database.`,
                                        answer: answer3
                                    });
                                });
                            } else {
                                res.status(200).json({
                                    message: `The faculty '${req.body.faculty.title}' was added successfully in the database.`,
                                    answer: answer2
                                });
                            }
                        });
                    });
                });

            });
        });
    })
};

module.exports = {
    getAllFaculties,
    getFacultiesFiltered,
    createFaculty
}