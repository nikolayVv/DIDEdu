const mongoose = require('mongoose');
const User = mongoose.model('User');
const University = mongoose.model('University');
const Faculty = mongoose.model('Faculty');


const getAllUsers = (req, res) => {
    User.find().exec((error, users) => {
       if (error) {
            return res.status(500).json(error);
       } else if (users && users.length === 0) {
            return res.status(404).json({ message: "There are no users in the database yet." });
       }
       res.status(200).json(users);
    });
};

const addUser = (req, res) => {
    if (!req.body.email || !req.body.name || !req.body.surname || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }
    User.findOne({ email: req.body.email }).exec((error, user) => {
        if (user) {
            return res.status(400).json({message: `User with email '${req.body.email}' already exists.`});
        } else if (error) {
            return res.status(500).json(error);
        }
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.surname = req.body.surname;
        newUser.email = req.body.email;
        newUser.title = req.body.title;
        newUser.setPassword(req.body.password);

        newUser.save((error) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json(newUser);
        });
    });
};

const getUniversityController = (req, res) => {
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
        } else if (university.controller === null) {
            return res.status(400).json({
                message: "The university doesn't have a controller yet."
            });
        }
        res.status(200).json(university.controller);
    });
};

const addUniversityController = (req, res) => {
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
        } else if (university.controller !== null) {
            return res.status(400).json({
                message: "The university already has a controller."
            });
        }
        createUniversityController(req, res, university);
    });
}

const createUniversityController = (req, res, university) => {
    if (!req.body.email || !req.body.name || !req.body.surname || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }
    User.findOne({ email: req.body.email }).exec((error, user) => {
        if (user) {
            return res.status(400).json({ message: `User with email '${req.body.email}' already exists.` });
        } else if (error) {
            return res.status(500).json(error);
        }
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.surname = req.body.surname;
        newUser.email = req.body.email;
        newUser.title = "university controller";
        newUser.setPassword(req.body.password);

        newUser.save((error) => {
            if (error) {
                return res.status(500).json(error);
            }
            university.controller = newUser;
            university.save((error) => {
                if (error) {
                    return res.status(500).json(error);
                }
                res.status(200).json(newUser);
            })
        });
    });
}

const getFacultyControllers = (req, res) => {
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
        } else if (faculty.controllers.length === 0) {
            return res.status(400).json({
                message: "The university doesn't have a controller yet."
            });
        }
        res.status(200).json(faculty.controllers);
    });
};

const addFacultyController = (req, res) => {
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
        createFacultyController(req, res, faculty);
    });
}

const createFacultyController = (req, res, faculty) => {
    if (!req.body.email || !req.body.surname || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }
    //TODO check if password right format
    User.findOne({ email: req.body.email }).exec((error, user) => {
        if (user) {
            return res.status(400).json({ message: `User with email '${req.body.email}' already exists.` });
        } else if (error) {
            return res.status(500).json(error);
        }
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.surname = req.body.surname;
        newUser.email = req.body.email;
        newUser.title = "faculty controller";
        newUser.setPassword(req.body.password);

        newUser.save((error) => {
            if (error) {
                return res.status(500).json(error);
            }
            faculty.controllers.push(newUser);
            faculty.save((error) => {
                if (error) {
                    return res.status(500).json(error);
                }
                res.status(200).json(newUser);
            })
        });
    });
}

const getUserById = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({
            message: "Couldn't find user, idUser is required parameter."
        });
    }
    User.findById(idUser)
        .select("_id name surname email title registrationDate publicKey courses")
        .exec((error, user) => {
            if (!user) {
                return res.status(404).json({
                    message: "Couldn't find a user with the given ID."
                });
            } else if (error) {
                return res.status(500).json(error);
            }
            res.status(200).json(user);
        }
    );
};

const deleteUser = (req, res) => {
    let idUser = req.params.idUser;
    if (!idUser) {
        return res.status(404).json({
            message: "Couldn't find student, idStudent is required parameter."
        });
    }
    User.findByIdAndRemove(idUser).exec((error) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.status(204).json(null);
    });
};

module.exports = {
    getAllUsers,
    addUser,
    getUserById,
    deleteUser,
    getUniversityController,
    addUniversityController,
    getFacultyControllers,
    addFacultyController
};