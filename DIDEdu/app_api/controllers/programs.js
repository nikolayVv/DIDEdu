const mongoose = require('mongoose');
const Faculty = mongoose.model('Faculty');
const Program = mongoose.model('Program');

const getAllFacultyPrograms = (req, res) => {
    let idFaculty = req.params.idFaculty;
    if (!idFaculty) {
        return res.status(404).json({
            message: "Couldn't find faculty, idFaculty is required parameter."
        });
    }
    Faculty.findById(idFaculty).exec((error, faculty) => {
        if (!faculty) {
            return res.status(404).json({
                message: "Couldn't find a faculty with the given ID."
            });
        } else if (error) {
            return res.status(500).json(error);
        } else if (faculty.programs.length === 0) {
            return res.status(404).json({ message: `There are no programs in '${faculty.title}' yet.` });
        }
        res.status(200).json(faculty.programs);
    });
};

const addFacultyProgram = (req, res) => {
    let idFaculty = req.params.idFaculty;
    if (!idFaculty) {
        return res.status(404).json({
            message: "Couldn't find faculty, idFaculty is required parameter."
        });
    }
    Faculty.findById(idFaculty).exec((error, faculty) => {
        if (!faculty) {
            return res.status(404).json({
                message: "Couldn't find a faculty with the given ID."
            });
        } else if (error) {
            return res.status(500).json(error);
        }
        createProgram(req, res, faculty);
    });
};

const createProgram = (req, res, faculty) => {
    if (!req.body.name) {
        return res.status(400).json({ message: "All the data is required." });
    }
    // TODO number right format
    Program
        .findOne({name: req.body.name,}).exec((error, program) => {
        if (program) {
            return res.status(400).json({ message: `Program with name '${req.body.name}' already exists.` });
        } else if (error) {
            return res.status(500).json(error);
        }
        Program.create(
            {
                name: req.body.name,
            },
            (error, program) => {
                if (error) {
                    return res.status(400).json(error);
                }
                faculty.programs.push(program);
                faculty.save((error) => {
                    if (error) {
                        return res.status(400).json(error);
                    }
                    res.status(201).json(program);
                });
            }
        );
    });
};

module.exports = {
    getAllFacultyPrograms,
    addFacultyProgram
}