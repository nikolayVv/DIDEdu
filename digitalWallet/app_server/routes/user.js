const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bip39 = require("bip39");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../model/User");

router.post(
  "/register",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({
        username
      });
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      const mnemonic = bip39.generateMnemonic(256).split(' ');

      user = new User({
        username,
        password,
        mnemonic,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token
          });
        }
      );
    } catch (err) {
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/login",
  [
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({
        username
      });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!user || !isMatch)
        return res.status(400).json({
          message: "Wrong credentials!"
        });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token: token,
            user: user
          });
        }
      );
    } catch (e) {
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

router.put("/:idUser/did/:did", auth, async(req, res) => {
  let idUser = req.params.idUser;
  let did = req.params.did;
  if (!idUser || !did) {
    return res.status(404).json({
      message: "Couldn't find user or did, idUniversity and did are required parameters."
    });
  }
  try {
    const user = await User.findById(idUser);
    if (!user) {
      return res.status(404).json({
        message: "Couldn't find user with idUser"
      });
    }
    for (let i = 0; i < user.didList.length ; i++) {
      if (user.didList[i].did === did) {
        user.didList[i].status = req.body.status;
        await user.save();
        break;
      }
    }
    res.json(user.didList);
  } catch (e) {
    res.status(500).json({
      message: "Error in Fetching user"
    });
  }
})

router.put("/:idUser", auth, async(req, res) => {
  let idUser = req.params.idUser;
  if (!idUser) {
    return res.status(404).json({
      message: "Couldn't find user, idUniversity is required parameter."
    });
  }
  try {
    const user = await User.findById(idUser);
    if (!user) {
      return res.status(404).json({
        message: "Couldn't find user with idUser"
      });
    }
    var isValid = true;
    for (let i = 0; i < user.didList.length ; i++) {
      if (user.didList[i].did === req.body.did) {
        isValid = false;
        break;
      }
    }
    if (isValid) {
      user.didList.push(req.body);
      await user.save();
      res.json({ dids: user.didList });
    } else {
      res.send({ message: "Not valid!", dids: user.didList });
    }
  } catch (e) {
    res.status(500).json({
      message: "Error in Fetching user"
    });
  }
})

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;
