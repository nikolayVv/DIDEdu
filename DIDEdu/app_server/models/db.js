const mongoose = require("mongoose");

const dbURI = "mongodb://localhost/DIDEdu";
mongoose.connect(dbURI);

mongoose.connection.on("connected", () => {
    console.log(`Mongoose connected on ${dbURI}.`);
});

mongoose.connection.on("error", (napaka) => {
    console.log("Mongoose error when connecting: ", napaka);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose isn't connected.");
});

const correctDisconnection = (m, cb) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose closed connection thru '${m}'.`);
        cb();
    })
}

// Restart nodemon
process.once("SIGUSR2", () => {
    correctDisconnection("nodemon restart", () => {
        process.kill(process.pid, "SIGUSR2");
    });
});

//Exit from Heroku application
process.on("SIGTERM", () => {
    correctDisconnection("exit from Heroku application", () => {
        process.exit(0);
    });
});

require("./models");