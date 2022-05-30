const connection = require('../models/db');

const getAllCities = (req, res) => {
    connection.query('SELECT * FROM city', (error, cities) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (cities && cities.length === 0) {
            return res.status(404).json({ message: "There are no cities in the database yet." });
        }
        res.status(200).json(cities);
    });
};

const addCity = (req, res) => {
    if (!req.body.name || !req.body.zip) {
        return res.status(400).json({ message: "All the data is required." });
    }

    let city = [
        req.body.zip,
        req.body.name
    ];

    connection.query('INSERT INTO city (zip, name) VALUES (?)', [ city ], (error, answer) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json({
            message: `New city with zip ${req.body.zip} was successfully created!`,
            answer: answer
        });
    })
};

const getCityByZip = (req, res) => {
    let zip = req.params.zip;
    if (!zip) {
        return res.status(404).json({
            message: "Couldn't find city, zip is required parameter."
        });
    }

    connection.query(`SELECT * FROM city WHERE zip='${zip}'`, (error, city) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!city[0]) {
            return res.status(404).json({ message: "Couldn't find city with the given zip." })
        }
        res.status(200).json(city[0]);
    });
};

const getZipsByCityName = (req, res) => {
    let cityName = req.params.cityName;
    if (!cityName) {
        return res.status(404).json({
            message: "Couldn't find zips, cityName is required parameter."
        });
    }

    connection.query(`SELECT * FROM city WHERE name='${cityName}'`, (error, zips) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (zips && zips.length === 0) {
            return res.status(404).json({ message: `There are no zips for '${cityName}' in the database yet.` });
        }
        res.status(200).json(zips);
    })
}

const editCity = (req, res) => {
    let cityName = req.params.cityName;
    if (!cityName) {
        return res.status(404).json({
            message: "Couldn't find zips, cityName is required parameter."
        });
    }
    if (!req.body.name) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM city WHERE name='${cityName}'`, (error, zips) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (zips && zips.length === 0) {
            return res.status(404).json({ message: `There are no zips for '${cityName}' in the database yet.` });
        }

        connection.query(`UPDATE city SET name='${req.body.name}' WHERE name='${req.body.name}'`, (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json({
                message: `Name of the city was successfully changed to '${req.body.name}'!`,
                answer: answer
            });
        });
    })
};

const editZip = (req, res) => {
    let zip = req.params.zip;
    if (!zip) {
        return res.status(404).json({
            message: "Couldn't find city, zip is required parameter."
        });
    }
    if (!req.body.name) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM city WHERE zip='${zip}'`, (error, city) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!city[0]) {
            return res.status(404).json({ message: "Couldn't find city with the given zip." })
        }

        connection.query(`UPDATE city SET name='${req.body.name}' WHERE zip='${zip}'`, (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json({
                message: `Name of the city for zip '${zip}' was successfully changed to '${req.body.name}'!`,
                answer: answer
            });
        });
    });

};

const deleteCity = (req, res) => {

};

const deleteZip = (req, res) => {
    let zip = req.params.zip;
    if (!zip) {
        return res.status(404).json({
            message: "Couldn't find city, zip is required parameter."
        });
    }

    //TODO => set FK in countries to null
    connection.query(`SELECT * FROM city WHERE zip='${zip}'`, (error, city) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!city[0]) {
            return res.status(404).json({message: "Couldn't find city with the given zip."})
        }

        connection.query(`DELETE FROM city WHERE zip='${zip}'`, (error, answer) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(201).json(null);
        });
    });
};

module.exports = {
    getAllCities,
    addCity,
    getCityByZip,
    getZipsByCityName,
    editCity,
    editZip,
    deleteCity,
    deleteZip
};