const mongoose = require("mongoose");
var crypto = require("crypto");
var uniqueValidator = require("mongoose-unique-validator");
const role = require("../_helpers/role");
const status = require("../_helpers/UserStatus");
const { number } = require("@hapi/joi");
var multer = require("multer");

const UserSchema = mongoose.Schema({
  user_id: { type: String, unique: true, required: true, index: true },
  account: {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: [true, "can't be blank"],
    },
    password: { type: String },
    salt: { type: String },
    hash: { type: String }, //Password Hash
    status: {
      type: String,
      enum: [
        status.PENDING,
        status.VERIFIED,
        status.REGISTERED,
        status.BLOCKED,
      ],
      default: status.PENDING,
    },
    role: {
      type: String,
      default: role.ADMIN,
      enum: [
        role.EMPLOYER,
        role.SUPER_ADMIN,
        role.ADMIN,
        role.VERIFIER,
        role.VENDOR,
      ],
    },
    active: { type: Boolean, default: false },
    created_on: {
      type: Date,
      default: Date.now,
    },
    last_login: { type: Date },
    token: { type: String, default: "" },
  },
  profile: {
    contactPersonName: { type: String, default: "" },
    desigination: { type: String, default: "" },

    company_name: { type: String, default: "" },
    company_category: { type: String, default: "" },
    owner_status: { type: String, default: "" },
    profile_picture: { type: String, default: "" },
    company_logo: { type: String, default: "" },
    business_card: {
      front: { type: String, default: "" },
      back: { type: String, default: "" },
    },

    mobile: {
      country_code: { type: String, default: "" },
      mobile: { type: String, default: "" },
    },
    alternateMobile: {
      country_code: { type: String, default: "" },
      mobile: { type: String, default: "" },
    },
    email: { type: String, default: "" },
    website: { type: String, default: "" },

    alternateEmail: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  landline: {
    std: { type: String, default: "" },
    landline: { type: String, default: "" },
  },
  alternateLandline: {
    std: { type: String, default: "" },
    landline: { type: String, default: "" },
  },
  fax: {
    std: { type: String, default: "" },
    fax: { type: String, default: "" },
  },

  deleted: { type: Boolean, default: false },

  companyDetail: {
    companyName: { type: String, default: "" },
    year: { type: String, default: "" },
    CEOname: { type: String, default: "" },
    contactName: { type: String, default: "" },
    websiteURL: { type: String, default: "" },
  },
  Address: {
    building: { type: String, default: "" },
    street: { type: String, default: "" },
    landmark: { type: String, default: "" },
    locality: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pincode: { type: String, default: "" },
  },
  statutary_details: {
    gstin: { type: String, default: "" },
    TAN: { type: String, default: "" },
    importExportCode: { type: String, default: "" },
    pan_number: { type: String, default: "" },
    cin_number: { type: String, default: "" },
    gst_certificate: { type: String, default: "" },
  },
  bank_account: {
    IFSC_code: { type: String, default: "" },
    bank_name: { type: String, default: "" },
    importExportCode: { type: String, default: "" },
    account_number: { type: String, default: "" },
    account_type: { type: String, default: "" },
  },
  business_nature: {
    primary_business: { type: String, default: "" },
    employee: { type: String, default: "" },
    ownership_type: { type: String, default: "" },
    annual_turnover: { type: String, default: "" },
    secondary_business: { type: String, default: "" },
  },
});

//User Schema methods
UserSchema.methods.setPassword = function (password) {
  this.account.salt = crypto.randomBytes(16).toString("hex");
  this.account.hash = crypto
    .pbkdf2Sync(password, this.account.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.account.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.account.hash === hash;
};
UserSchema.plugin(uniqueValidator, { message: "is already taken." });
module.exports = mongoose.model("User", UserSchema);
