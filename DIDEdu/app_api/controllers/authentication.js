const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const register = (req, res) => {

};

const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All the data is required." });
    } else if ( !/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(req.body.elektronskiNaslov)) {
        return res.status(400).json({ message: "Email isn't the right format." });
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
    register,
    login
}