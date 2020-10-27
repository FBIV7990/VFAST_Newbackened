const config = require("../config.json");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const Role = require("../_helpers/role");
const db = require("../_helpers/db");
const smsService = require("./sms.service");
const randomstring = require("randomstring");
const emailService = require("./email.service");
const helper = require("../_helpers/helper");
const Status = require("../_helpers/UserStatus");
const multer = require("multer");

const User = db.User;
const Control = db.Control;

// export userservice
module.exports = {
  authenticate,
  create,
  contactDetail,
  getAll,
  businessProfile,
  updateImages,
};

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "_" + Date.now() + "." + file.mimetype.substring(6)
    );
  },
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    console.log(file);
    let fileExts = ["png", "jpg", "jpeg"];
    helper.sanitizeFile(file, cb, fileExts);
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "pancard_upload", maxCount: 1 },
  { name: "agreement", maxCount: 1 },
  { name: "gst_certificate", maxCount: 1 },
  { name: "other", maxCount: 1 },
]);

// create user
function create(req) {
  const userParam = req.body;
  console.log(userParam);
  const schema = Joi.object().keys({
    username: Joi.string().min(12).required(),
    password: Joi.string().min(8).max(30).required(),
  });
  return new Promise((resolve, reject) => {
    const { error, value } = schema.validate(userParam);
    if (error) {
      reject(error);
      return;
    }

    let { username, password } = userParam;
    var country_code;
    const onlyNumbers = /^[0-9]+$/;

    var mailformat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    const isMobile = onlyNumbers.test(username);

    const isEmail = mailformat.test(username);

    console.log(isMobile + " " + isEmail);
    if (!isMobile && !isEmail) {
      reject({
        success: false,
        message:
          "Invalid username! Please provide a valid email address or mobile number.",
      });
      return;
    }
    if (isMobile) {
      country_code = username.substring(0, username.length - 10);
      var mobile_num = username.substring(
        username.length - 10,
        username.length
      );
      username = mobile_num;
    }

    // validate
    User.findOne({
      "account.username": username,
    })
      .then(async (user) => {
        console.log(user);
        if (!user) {
          const user = new User();
          const control = await Control.findOne();

          user.user_id =
            control.user_prefix + helper.paddNumber(control.user_counter);
          const token = jwt.sign(
            { sub: user.id, role: Role.EMPLOYER },
            config.secret
          );
          user.account = {
            username: username,
            password: randomstring.generate({
              length: 6,
              charset: "numeric",
              readable: true,
            }),
            token: token,
            status: Status.PENDING,
            role: Role.EMPLOYER,
            active: true,
            created_on: new Date(),
          };

          if (password) user.setPassword(password);

          if (isMobile) {
            smsService
              .sendSMS(country_code + username, user.account.securityCode)
              .then((sms) => {
                console.log(sms);
              })
              .catch((err) => {
                reject(err);
              });

            user.profile.mobile = {
              country_code: country_code,
              mobile: mobile_num,
            };
          } else if (isEmail) {
            emailService
              .sendMail(username, user.account.securityCode)
              .then((email) => {
                console.log(email);
              })
              .catch((err) => {
                reject(err);
              });
            user.profile.email = username;
          }

          // save user
          user
            .save()
            .then((user) => {
              control.user_counter += 1;
              control.save();
              resolve({
                success: true,
                message: "User registered successfully!",
                id: user.id,
                role: user.account.role,
                token: token,
              });
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve({
            success: false,
            message: "User already exists! Please login",
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// login
function authenticate(req) {
  const schema = Joi.object().keys({
    username: Joi.string().min(10).max(40).required(),
    password: Joi.string().min(8).max(30).required(),
  });
  console.log(req.body);

  return new Promise(async (resolve, reject) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      reject(error);
      return;
    }

    const { username, password } = req.body;
    return await User.findOne({
      "account.username": username,
      deleted: false,
    })
      .then((user) => {
        if (!user) {
          resolve({ success: false, message: "Invalid username or password!" });
          return;
        }
        if (user.account.salt && user.validPassword(password)) {
          const token = jwt.sign(
            { sub: user.id, role: user.account.role },
            config.secret
          );
          resolve({
            success: true,
            message: "Authentication Successful!",
            id: user.id,
            role: user.account.role,
            token: token,
          });
        } else resolve({ success: false, message: "Invalid Password!" });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

//complete contact profile
function contactDetail(req, res) {
  return new Promise((resolve, reject) => {
    const schema = Joi.object().keys({
      id: Joi.string().min(24).max(24).required(),
      contactPersonName: Joi.string(),
      desigination: Joi.string(),
      mobile: Joi.object().keys({
        country_code: Joi.string(),
        mobile: Joi.string(),
      }),
      alternateMobile: Joi.object().keys({
        country_code: Joi.string(),
        mobile: Joi.string(),
      }),
      email: Joi.string(),
      alternateEmail: Joi.string(),
      landline: Joi.object().keys({
        std_code: Joi.string(),
        landline: Joi.string(),
      }),
      alternateLandline: Joi.object().keys({
        std_code: Joi.string(),
        landline: Joi.string(),
      }),
      fax: Joi.object().keys({
        std_code: Joi.string(),
        fax: Joi.string(),
      }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      reject(error);
      return;
    }
    const {
      id,
      contactPersonName,
      desigination,
      mobile,
      alternateMobile,
      email,
      alternateEmail,
      landline,
      alternateLandline,
      fax,
    } = req.body;

    return User.findById(id)
      .then((user) => {
        if (!user)
          reject({
            success: false,
            message: "User not found",
          });

        contactPersonName &&
          (user.profile.contactPersonName = contactPersonName);
        desigination && (user.profile.desigination = desigination);
        mobile && (user.profile.mobile = mobile);
        alternateMobile && (user.profile.alternateMobile = alternateMobile);
        email && (user.profile.email = email);
        alternateEmail && (user.profile.alternateEmail = alternateEmail);
        landline && (user.profile.landline = landline);
        alternateLandline &&
          (user.profile.alternateLandline = alternateLandline);
        fax && (user.profile.fax = fax);

        return user
          .save()
          .then((res) => {
            resolve({ success: "true", message: "contact profile updated." });
          })
          .catch((err) => {
            console.log(err);
            reject({ success: false, message: err });
          });
      })
      .catch((error) => {
        console.log(error);
        reject({ success: false, message: error });
      });
  });
}

// business profile
function businessProfile(req, res) {
  return new Promise((resolve, reject) => {
    const schema = Joi.object().keys({
      id: Joi.string().min(24).max(24).required(),
      companyDetail: {
        companyName: Joi.string(),
        year: Joi.string(),
        CEOname: Joi.string(),
        contactName: Joi.string(),
        websiteURL: Joi.string(),
      },
      Address: {
        building: Joi.string(),
        street: Joi.string(),
        landmark: Joi.string(),
        locality: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        pincode: Joi.string(),
      },
      statutary_details: {
        gstin: Joi.string(),
        TAN: Joi.string(),
        importExportCode: Joi.string(),
        pan_number: Joi.string(),
        cin_number: Joi.string(),
        gst_certificate: Joi.string(),
      },
      bank_account: {
        IFSC_code: Joi.string(),
        bank_name: Joi.string(),
        importExportCode: Joi.string(),
        account_number: Joi.string(),
        account_type: Joi.string(),
      },
      business_nature: {
        primary_business: Joi.string(),
        employee: Joi.string(),
        ownership_type: Joi.string(),
        annual_turnover: Joi.string(),
        secondary_business: Joi.string(),
      },
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      reject(error);
      return;
    }
    const {
      id,
      companyDetail,
      Address,
      statutary_details,
      bank_account,
      business_nature,
    } = req.body;

    return User.findById(id)
      .then((user) => {
        if (!user)
          reject({
            success: false,
            message: "User not found",
          });

        companyDetail && (user.profile.companyDetail = companyDetail);
        Address && (user.profile.Address = Address);
        statutary_details &&
          (user.profile.statutary_details = statutary_details);
        bank_account && (user.profile.bank_account = bank_account);
        business_nature && (user.profile.business_nature = business_nature);

        return user
          .save()
          .then((res) => {
            resolve({ success: "true", message: "business profile updated." });
          })
          .catch((err) => {
            console.log(err);
            reject({ success: false, message: err });
          });
      })
      .catch((error) => {
        console.log(error);
        reject({ success: false, message: error });
      });
  });
}

//Update Images
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "_" + Date.now() + "." + file.mimetype.substring(6)
    );
  },
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    console.log(file);
    let fileExts = ["png", "jpg", "jpeg"];
    helper.sanitizeFile(file, cb, fileExts);
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "profile", maxCount: 1 },
  { name: "cardfront", maxCount: 1 },
  { name: "cardback", maxCount: 1 },
  { name: "gst_certificate", maxCount: 1 },
]);

//get All (/)
function getAll(query) {
  return new Promise((resolve, reject) => {
    filter = {};
    if (query.type) {
      const schema = Joi.object().keys({
        type: Joi.string().allow([
          "ADMIN",
          "EMPLOYER",
          "SUPER_ADMIN",
          "VERIFIER",
          "VENDOR",
        ]),
      });

      const { error, value } = schema.validate(query);
      console.log(error, value);
      if (error) {
        reject(error);
        return;
      }
      var type = query.type.toUpperCase();
      filter = { "account.role": type, deleted: false };
    } else {
      filter = { deleted: false };
    }

    User.find(filter, {
      "account.salt": 0,
      "account.hash": 0,
      "account.token": 0,
      "account.securityCode": 0,
    })
      .sort({ "account.created_on": -1 })
      .then((users) => {
        if (!users) resolve({ success: false, message: "No users found" });
        else resolve({ success: true, users: users });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

//upload file
function updateImages(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, function (err) {
      if (err) {
        reject(err);
        return;
      }

      const schema = Joi.object().keys({
        id: Joi.string().min(24).max(24).required(),
      });
      const { error, value } = schema.validate(req.body);

      if (error) {
        reject(error);
        return;
      }
      const { id } = req.body;

      User.findById(id)
        .then((user) => {
          if (!user) {
            resolve({ success: false, message: "User not found" });
          }
          console.log(req.files);

          const outputfile = helper.getServerUrl(req) + "images/";

          if (req.files.logo && req.files.logo[0]) {
            user.profile.company_logo = outputfile + req.files.logo[0].filename;
            // console.log( resizeFile("./images/"+req.files.logo[0].filename,150,150,"./images/img2.jpg"))
          }

          if (req.files.profile && req.files.profile[0])
            user.profile.profile_picture =
              outputfile + req.files.profile[0].filename;

          if (req.files.cardfront && req.files.cardfront[0])
            user.profile.business_card.front =
              outputfile + req.files.cardfront[0].filename;

          if (req.files.cardback && req.files.cardback[0])
            user.profile.business_card.back =
              outputfile + req.files.cardback[0].filename;

          if (req.files.gst_certificate && req.files.gst_certificate[0])
            user.statutary_details.gst_certificate =
              outputfile + req.files.gst_certificate[0].filename;

          user
            .save()
            .then((res) => {
              resolve({ success: true, message: "User images updated." });
            })
            .catch((err) => {
              reject({ success: false, message: err });
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
