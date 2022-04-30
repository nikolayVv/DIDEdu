const mongoose = require('mongoose');
const University = mongoose.model('University');
const Faculty = mongoose.model('Faculty');

const getAllFaculties = (req, res) => {
    Faculty.find().exec((error, faculties) => {
        if (error) {
            return res.status(500).json(error);
        } else if (faculties && faculties.length === 0) {
            return res.status(404).json({ message: "There are no faculties in the database yet." });
        }
        res.status(200).json(faculties);
    });
};

const getAllUniversityFaculties = (req, res) => {
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
        } else if (university.faculties.length === 0) {
            return res.status(404).json({ message: `There are no faculties in '${university.title}' yet.` });
        }
        res.status(200).json(university.faculties);
    });
};


const addUniversityFaculty = (req, res) => {
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
        createFaculty(req, res, university);
    });
};

const createFaculty = (req, res, university) => {
    if (!req.body.title || !req.body.address || !req.body.contactNumber) {
        return res.status(400).json({ message: "All the data is required." });
    }
    // TODO number right format
    Faculty.findOne({ title: req.body.title }).exec((error, faculty) => {
        if (faculty) {
            return res.status(400).json({ message: `Faculty with name '${req.body.title}' already exists.` });
        } else if (error) {
            return res.status(500).json(error);
        }
        Faculty.create(
            {
                title: req.body.title,
                abbreviation: req.body.abbreviation,
                address: req.body.address,
                contactNumber: req.body.contactNumber
            },
            (error, faculty) => {
                if (error) {
                    return res.status(400).json(error);
                }
                university.faculties.push(faculty);
                university.save((error) => {
                    if (error) {
                        return res.status(400).json(error);
                    }
                    res.status(201).json(faculty);
                });
            }
        );
    });
}

module.exports = {
    getAllFaculties,
    getAllUniversityFaculties,
    addUniversityFaculty
}