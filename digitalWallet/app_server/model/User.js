const mongoose = require("mongoose");

const credentialSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  credential: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  },
  operationId: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  batchId: {
    type: String,
    required: true
  }
})

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
  },
  credentialsList: {
    type: [credentialSchema],
    default: []
  },
  operationId: {
    type: String,
    required: true
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
