/**
 * user.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * User Model
 *
 * @format
 */

var config = require("../config.js"),
  jwt = require("jsonwebtoken"),
  mongoose = require("mongoose"),
  bcrypt = require("bcryptjs"),
  Schema = mongoose.Schema;

var Address = new Schema(
  {
    name: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    twilio: { type: String, required: false, unique: false },
    instructions: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    usePushEach: true, // $pushAll has been removed from Mongo version > 3.5.
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Address", Address);

const ROLES = [
  "Default Admin",
  "Owner",
  "Admin",
  "Supervisor",
  "Employee",
  "Temporary Employee",
  "Intern",
];
const GENDERS = ["Male", "Female", "Non-Binary", "Undefined", "Unspecified"];

var User = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: { type: String, required: false },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: false },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    twilio: { type: String, required: false, unique: true },
    addresses: [{ type: Address, required: false }],
    birthday: { type: Date, required: false, unique: false },
    gender: { type: String, enum: GENDERS, required: false },
    image: { type: Schema.Types.ObjectId, ref: "Photo", required: false },
    billingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: false,
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: false,
    },
    admin: { type: Boolean, required: true, default: false },
    adminSettings: {
      role: { type: String, enum: ROLES },
      security_level: { type: Number, max: 4, min: 0 },
    },
    _resetPasswordToken: String,
    _resetPasswordExpires: Date,
  },
  {
    versionKey: false,
    usePushEach: true, // $pushAll has been removed from Mongo version > 3.5.
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

// Generate a token for the User
User.methods.generateToken = function () {
  return jwt.sign({ userId: this._id }, config.jwt.secretOrKey, {
    algorithm: config.jwt.algorithm,
    expiresIn: config.jwt.expiration,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
};

// Encrypt the password if the password has been changed on Administrator Update
User.pre("save", function (next) {
  var user = this;

  let twilio = user.phone.replace(/\D/g, "");
  console.log(twilio);
  this.twilio = twilio;
  if (user.twilio.charAt(0) != "1") {
    user.twilio = "1" + user.twilio;
  }

  if (user.admin == false) user.adminSettings = undefined;

  // ignore the rest if password is not modified
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(config.database.salt_work_factor, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Verify that the password and the repeated password match
User.methods.isValidPassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model("User", User);
