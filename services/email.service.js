var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "support@ebonz.in",
    pass: "Vincy1980$",
  },
});

exports.sendMail = (email, OTP) => {
  return new Promise((resolve, reject) => {
    var mailOptions = {
      from: "support@ebonz.in",
      to: email,
      subject: OTP + " is your Security code for VFAST account",
      text:
        "Welcome to VFAST,\n Please confirm your email address.\n Your verification code is : " +
        OTP +
        "\n\nThanks,\n VFAST Team.\nWeb:www.vfast.co.in",
    };

    return transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject({
          success: false,
          message: "Could not sent OTP. Please try again later.",
        });
      } else {
        resolve({ success: true, message: "Email sent." });
      }
    });
  });
};
exports.sendPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    var mailOptions = {
      from: "support@ebonz.in",
      to: email,
      subject: "Account details for Vfast account",
      text:
        "Welcome to Vfast,\n Please login to your account with the given password.\n Your Password  is : " +
        password +
        "\n\nThanks,\n Vfast Team.\nWeb:www.vfast.co.in",
    };

    return transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject({
          success: false,
          message: "Could not sent Email. Please try again later.",
        });
      } else {
        resolve({ success: true, message: "Email sent." });
      }
    });
  });
};

exports.sendVerificationLink = (email, link, pin) => {
  return new Promise((resolve, reject) => {
    var mailOptions = {
      from: "support@ebonz.in",
      to: email,
      subject: "New Verification",
      text:
        "Hello, We have added a new verification for you. \n Verification link : " +
        link +
        ",\n and security pin :" +
        pin +
        ".\n\nThanks,\n Vfast Team.\nWeb:www.vfast.co.in",
    };

    return transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject({
          success: false,
          message: "Could not sent Email. Please try again later.",
        });
      } else {
        resolve({ success: true, message: "Email sent." });
      }
    });
  });
};
