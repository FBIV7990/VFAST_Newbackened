const express = require("express");
const router = express.Router();
const authorize = require("../_helpers/authorize");
const Roles = require("../_helpers/role");
const userService = require("../services/user.service");
const { contactDetail } = require("../services/user.service");

//route
router.post("/register", register);
router.post("/login", login);
router.post("/contactdetail", ContactDetail);
router.get("/", getAll);
router.post("/businessprofile", BusinessProfile);
router.post('/uploadImages',uploadImages);



//function
//////////////////Login USER///////////////////
function login(req, res, next) {
  userService
    .authenticate(req)
    .then((user) => res.json(user))
    .catch((err) => {
      next(err);
    });
}

//////////////////REGISTER USER///////////////////
function register(req, res, next) {
  console.log(req.body);
  userService
    .create(req)
    .then((user) => res.json(user))
    .catch((err) => {
      next(err);
    });
}

//////////////////COMPLETE USER PROFILE///////////////////
function ContactDetail(req, res, next) {
  userService
    .contactDetail(req)
    .then((user) => res.json(user))
    .catch((err) => {
      next(err);
    });
}

/////////////////get All/////////////////
function getAll(req, res, next) {
  userService
    .getAll(req.query)
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

///////////////business profile////////////
function BusinessProfile(req, res, next) {
  userService
    .businessProfile(req)
    .then((user) => res.json(user))
    .catch((err) => {
      next(err);
    });
}

/////////////////upload image////////////
function uploadImages(req, res, next) {
 
  userService
    .updateImages(req)
    .then(msg =>
      res.json(msg)
    )
    .catch(err => {
      next(err);
    });
}

// export
module.exports = router;
