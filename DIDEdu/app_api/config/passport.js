const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        (email, password, cbFinished) => {
            User.findOne(
                { email: email },
                (error, user) => {
                    if (error) return cbFinished(error);
                    if (!user || !user.checkPassword(password)) {
                        console.log("inside")
                        return cbFinished(null, false, {
                            message: "Wrong credentials.",
                        });
                    }
                    return cbFinished(null, user);
                }
            );
        }
    ),
);