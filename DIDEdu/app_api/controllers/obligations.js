const connection = require('../models/db');
const util = require("util");

const addObligationsGroup = (req, res) => {
    let idCourse = req.params.idCourse;
    if (!idCourse) {
        return res.status(404).json({ message: "Couldn't find course, idCourse is required parameter." });
    }

    if (!req.body.title || !req.body.type) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM course WHERE id_course='${idCourse}'`, (error, courses) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!courses[0]) {
            return res.status(404).json({ message: "Couldn't find course with the given ID." })
        }

        connection.query(`SELECT * FROM obligations_group WHERE title='${req.body.title}' AND course='${idCourse}' AND type='${req.body.type}'`, (error, obligationsGroups) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (obligationsGroups[0]) {
                return res.status(409).json({ message: `The chosen ${req.body.type} is already taken for this course.` });
            }

            let newObligationsGroup = [
                req.body.title,
                idCourse,
                req.body.type
            ];
            connection.query('INSERT INTO obligations_group (title, course, type) VALUES (?)', [ newObligationsGroup ], (error, answer) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.status(200).json({
                    message: `The obligations group '${req.body.title}' was added successfully in the database.`,
                    answer: answer
                });
            });
        });
    });
};

const addObligation = (req, res) => {
    let idObligationsGroup = req.params.idObligationsGroup;
    if (!idObligationsGroup) {
        return res.status(404).json({ message: "Couldn't find obligations group, idObligationsGroup is required parameter." });
    }

    if (!req.body.title) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`SELECT * FROM obligations_group WHERE id_obligations_group='${idObligationsGroup}'`, (error, obligationsGroups) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (!obligationsGroups[0]) {
            return res.status(404).json({ message: "Couldn't find course with the given ID." })
        }

        connection.query(`SELECT * FROM obligation WHERE title='${req.body.title}' AND obligations_group='${idObligationsGroup}'`, (error, obligations) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (obligations[0]) {
                return res.status(409).json({ message: `The chosen ${obligationsGroups[0].type} is already taken for this obligations group.` });
            }

            let newObligation = [
                req.body.title,
                new Date(Date.now()),
                idObligationsGroup
            ];
            connection.query('INSERT INTO obligation (title, created, obligations_group) VALUES (?)', [ newObligation ], (error, answer) => {
                if (error) {
                    return res.status(500).json(error);
                }

                res.status(200).json({
                    message: `The obligation '${req.body.title}' was added successfully in the database.`,
                    answer: answer
                });
            });
        });
    });
}

const getAllObligationsGroupsByCourse = (req, res) => {
    let idCourse = req.params.idCourse;
    if (!idCourse) {
        return res.status(404).json({ message: "Couldn't find course, idCourse is required parameter." });
    }

    connection.query(`SELECT * FROM obligations_group WHERE course='${idCourse}'`,async (error, obligationsGroups) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (obligationsGroups.length === 0) {
            return res.status(200).json([]);
        }

        let result = [];
        let groupsIds = []
        obligationsGroups.forEach((obligationsGroup) => {
            let newResult = {
                id_obligations_group: obligationsGroup.id_obligations_group,
                title: obligationsGroup.title,
                course: obligationsGroup.course,
                type: obligationsGroup.type,
                obligations: []
            }
            result.push(newResult);
            groupsIds.push(obligationsGroup.id_obligations_group);
        })

        connection.query(`SELECT * FROM obligation WHERE obligations_group IN (${groupsIds.join()})`, (error, obligations) => {
            if (error) {
                return res.status(500).json(error);
            }
            obligations.forEach((obligation) => {
                let groupIndex = result.findIndex(group => {
                    return group.id_obligations_group === obligation.obligations_group
                });
                if (groupIndex !== -1) {
                    result[groupIndex].obligations.push(obligation);
                }
            });

            res.status(200).json(result);
        });

    })
}

const changeObligationStatus = (req, res) => {
    let idObligation = req.params.idObligation;
    if (!idObligation) {
        return res.status(404).json({ message: "Couldn't find obligation, idObligation is required parameter." });
    }
    if (!req.body.status) {
        return res.status(400).json({ message: "All the data is required." });
    }

    connection.query(`UPDATE obligation SET status='${req.body.status}' WHERE id_obligation='${idObligation}'`, (error, answer) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(200).json({
            message: `Status was successfully changed!`,
            answer: answer
        });
    });
}

module.exports = {
    addObligationsGroup,
    getAllObligationsGroupsByCourse,
    addObligation,
    changeObligationStatus
}
