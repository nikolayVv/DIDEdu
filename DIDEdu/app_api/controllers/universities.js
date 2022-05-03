const mongoose = require('mongoose');
const University = mongoose.model('University');
const User = mongoose.model('User');

const getAllUniversities = (req, res) => {
    University.find().exec((error, universities) => {
        if (error) {
            return res.status(500).json(error);
        } else if (universities && universities.length === 0) {
            return res.status(404).json({ message: "There are no universities in the database yet." });
        }
        res.status(200).json(universities);
    });
};

const getUniversityById = (req, res) => {
    let idUniversity = req.params.idUniversity;
    if (!idUniversity) {
        return res.status(404).json({
            message: "Couldn't find university, idUniversity is required parameter."
        });
    }
    University.findById(idUniversity).exec((error, university) => {
        if (!university) {
            return res.status(404).json({
                message: "Couldn't find a university with the given ID."
            });
        } else if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json(university);
    });
};

const addUniversity = (req, res) => {
    if (!req.body.title || !req.body.country || !req.body.city) {
        return res.status(400).json({ message: "Title is required." });
    }
    University.findOne({ title: /^req.body.title$/i }).exec((error, university) => {
        if (university) {
            return res.status(400).json({ message: `University with name '${req.body.title}' already exists.` });
        } else if (error) {
            return res.status(500).json(error);
        }
        University.create(
            {
                title: req.body.title,
                abbreviation: req.body.abbreviation,
                country: req.body.country,
                city: req.body.city
            },
            (error, university) => {
                if (error) {
                    return res.status(400).json(error);
                }
                res.status(201).json(university);
            }
        );
    });
};




module.exports = {
    getAllUniversities,
    getUniversityById,
    addUniversity,
}