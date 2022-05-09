const mongoose = require("mongoose");

const didSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  did: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  }
})

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mnemonic: {
    type: [String],
    required: true
  },
  didList: {
    type: [didSchema],
    default: []
  }
}, {
  timestamps: true
});

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);
