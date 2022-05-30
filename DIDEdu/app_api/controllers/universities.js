const connection = require('../models/db');

const getAllUniversities = (req, res) => {
    connection.query(`SELECT * FROM university`, (error, universities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (universities.length === 0) {
            return res.status(404).json({ message: `There are no universities in the database yet.` })
        }

        res.status(200).json(universities);
    });
};

const createUniversity = (req, res) => {
    if (!req.body.title || !req.body.country || !req.body.city || !req.body.zip || !req.body.street || !req.body.houseNumber) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM university WHERE title='${req.body.title}'`, (error, universities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (universities[0]) {
            return res.status(404).json({ message: `The university '${universities[0].title}' is already in the database.` })
        }

        connection.query(`SELECT * FROM city WHERE zip='${req.body.zip}' AND name='${req.body.city}'`, (error, cities) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (!cities[0]) {
                return res.status(404).json({ message: `Couldn't find a city '${req.body.city}' with the zip '${req.body.zip}'.` })
            }
            connection.query(`SELECT * FROM country WHERE city='${cities[0].zip}' AND name='${req.body.country}'`, (error, countries) => {
                if (error) {
                    return res.status(500).json(error);
                }
                if (!countries[0]) {
                    return res.status(404).json({ message: `Couldn't find a country '${req.body.country}' with city '${req.body.city}' and zip '${req.body.zip}'.` })
                }

                connection.query(`SELECT * FROM address WHERE street='${req.body.street}' AND house_number='${req.body.houseNumber}' AND country='${countries[0].id_country}'`, (error, addresses) => {
                    if (error) {
                        return res.status(500).json(error);
                    }
                    if (addresses[0]) {
                        return res.status(409).json({ message: "The chosen address is already taken. Please change it and try again." });
                    }

                    let newAddress = [
                        req.body.street,
                        req.body.houseNumber,
                        countries[0].id_country
                    ];
                    connection.query('INSERT INTO address (street, house_number, country) VALUES (?)', [ newAddress ], (error, answer) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        let newUniversity = [
                            req.body.title,
                            req.body.abbreviation ? req.body.abbreviation : "",
                            answer.insertId
                        ];
                        connection.query('INSERT INTO university (title, abbreviation, address) VALUES (?)', [ newUniversity ], (error, answer) => {
                            if (error) {
                                return res.status(500).json(error);
                            }

                            res.status(200).json({
                                message: `The university '${req.body.title}' was added successfully in the database.`,
                                answer: answer
                            });
                        });
                    });
                });

            });
        });
    })
};

const getUniversitiesFiltered = (req, res) => {
    if (!req.body.value) {
        getAllUniversities(req, res);
    } else {
        switch (req.body.type) {
            case "country":
                getFilteredByCountry(req, res);
                break;
            case "city":
                getFilteredByCity(req, res);
                break;
            default:
                getFilteredByName(req, res);
        }
    }

};

const getFilteredByCountry = (req, res) => {
    connection.query(`SELECT id_country FROM country WHERE name LIKE '%${req.body.value}%'`, (error, countries) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (countries.length === 0) {
            return res.status(404).json({ message: `No countries found with the name '${req.body.value}'.` });
        }

        let idsCountries = [];
        countries.forEach(country => {
            idsCountries.push(country.id_country);
        });

        connection.query(`SELECT id_address FROM address WHERE country IN (?)`, [ idsCountries ], (error, addresses) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (addresses.length === 0) {
                return res.status(404).json({ message: `No addresses found for country with the name '${req.body.value}'.` });
            }

            let idsAddresses = [];
            addresses.forEach(address => {
               idsAddresses.push(address.id_address);
            });

            connection.query(`SELECT * FROM university WHERE address IN (?)`, [ idsAddresses ], (error, universities) => {
                if (error) {
                    return res.status(500).json(error);
                }
                if (universities.length === 0) {
                    return res.status(404).json({ message: `No universities found in the country '${req.body.value}'.` });
                }

                res.status(200).json(universities);
            });
        })
    })
};

const getFilteredByCity = (req, res) => {
    connection.query(`SELECT zip FROM city WHERE name LIKE '%${req.body.value}%'`, (error, cities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (cities.length === 0) {
            return res.status(404).json({ message: `No cities found with the name '${req.body.value}'.` });
        }

        let idsCities = [];
        cities.forEach(city => {
           idsCities.push(city.zip);
        });


        connection.query('SELECT id_country FROM country WHERE city IN (?)', [ idsCities ], (error, countries) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (countries.length === 0) {
                return res.status(404).json({ message: `No countries found for the city with the name '${req.body.value}'.` });
            }

            let idsCountries = [];
            countries.forEach(country => {
                idsCountries.push(country.id_country);
            });

            connection.query(`SELECT id_address FROM address WHERE country IN (?)`, [ idsCountries ], (error, addresses) => {
                if (error) {
                    return res.status(500).json(error);
                }
                if (addresses.length === 0) {
                    return res.status(404).json({ message: `No addresses found for city with the name '${req.body.value}'.` });
                }

                let idsAddresses = [];
                addresses.forEach(address => {
                    idsAddresses.push(address.id_address);
                });

                connection.query(`SELECT * FROM university WHERE address IN (?)`, [ idsAddresses ], (error, universities) => {
                    if (error) {
                        return res.status(500).json(error);
                    }
                    if (universities.length === 0) {
                        return res.status(404).json({ message: `No universities found in the city '${req.body.value}'.` });
                    }

                    res.status(200).json(universities);
                });
            });
        });
    });
};

const getFilteredByName = (req, res) => {
    connection.query(`SELECT * FROM university WHERE title LIKE '%${req.body.value}%'`, (error, universities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (universities.length === 0) {
            return res.status(404).json({ message: `No universities found with name '${req.body.value}'.` });
        }

        res.status(200).json(universities);
    });
};

const getUniversityById = (req, res) => {
    let idUniversity = req.params.idUniversity;
    if (!idUniversity) {
        return res.status(404).json({ message: "Couldn't find university, idUniversity is required parameter."});
    }

    connection.query(`SELECT * FROM university WHERE id_university='${idUniversity}'`, (error, universities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!universities[0]) {
            return res.status(404).json({ message: "Couldn't find university with the given ID." })
        }

        connection.query(`SELECT * FROM address WHERE id_address='${universities[0].address}'`, (error, addresses) => {
            if (error) {
                return res.status(500).json(error);
            }

            connection.query(`SELECT * FROM country WHERE id_country='${addresses[0].country}'`, (error, countries) => {
                if (error) {
                    return res.status(500).json(error);
                }

                connection.query(`SELECT * FROM city WHERE zip='${countries[0].city}'`, (error, cities) => {
                    if (error) {
                        return res.status(500).json(error);
                    }

                    connection.query(`SELECT * FROM faculty WHERE university='${universities[0].id_university}'`, (error, faculties) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        connection.query(`SELECT * FROM university_controller WHERE university='${universities[0].id_university}'`, (error, controllers) => {
                            if (error) {
                                return res.status(500).json(error);
                            }

                            let result = {
                                id_university: universities[0].id_university,
                                title: universities[0].title,
                                abbreviation: universities[0].abbreviation,
                                country: countries[0].name,
                                city: cities[0].name,
                                faculties: faculties,
                                controllers: controllers.length
                            }

                            res.status(200).json(result);
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    getAllUniversities,
    createUniversity,
    getUniversitiesFiltered,
    getUniversityById
}