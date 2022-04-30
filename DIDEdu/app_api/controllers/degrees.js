const mongoose = require("mongoose");
const Program = mongoose.model('Program');

const getAllProgramDegrees = (req, res) => {
    let idProgram = req.params.idProgram;
    if (!idProgram) {
        return res.status(404).json({
            message: "Couldn't find program, idProgram is required parameter."
        });
    }
    Program.findById(idProgram).exec((error, program) => {
        if (!program) {
            return res.status(404).json({
                message: "Couldn't find a program with the given ID."
            });
        } else if (error) {
            return res.status(500).json(error);
        } else if (program.degrees.length === 0) {
            return res.status(404).json({ message: `There are no degrees in '${program.name}' yet.` });
        }
        res.status(200).json(program.degrees);
    });
};

const addProgramDegree = (req, res) => {
    let idProgram = req.params.idProgram;
    if (!idProgram) {
        return res.status(404).json({
            message: "Couldn't find program, idProgram is required parameter."
        });
    }
    Program.findById(idProgram).exec((error, program) => {
        if (!program) {
            return res.status(404).json({
                message: "Couldn't find a program with the given ID."
            });
        } else if (error) {
            return res.status(500).json(error);
        }
        createDegree(req, res, program)
    });
};

const createDegree = (req, res, program) => {
    if (!req.body.title || !req.body.duration) {
        return res.status(400).json({ message: "All the data is required." });
    }
    let exists = false;
    for (let i = 0; i < program.degrees.length; i++) {
        if (program.degrees[i].title === req.body.title) {
            return res.status(400).json({ message: `Degree already exists.` });
        }
    }
    let degree = {
        title: req.body.title,
        duration: req.body.duration
    }
    program.degrees.push(degree)
    program.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(201).json(degree);
    });
};

module.exports = {
    addProgramDegree,
    getAllProgramDegrees
}