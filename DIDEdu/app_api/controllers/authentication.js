const passport = require("passport");
const mongoose = require("mongoose");


const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    }

    passport.authenticate("local", (error, user, information) => {
        if (error) {
           return res.status(500).json(error);
       }
       if (user) {
           return res.status(200).json({ token: user.generateJwt() });
       }
       res.status(401).json({ message: information });
    })(req, res);
};

module.exports = {
    login
}