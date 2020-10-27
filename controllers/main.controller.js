var router = require("express").Router();

//route
//router.use("/", (req, res) => {
//res.json({ success: true, message: "Hi, Welcome to VFAST" });
//});

router.use("/users", require("./user.controller"));

//export
module.exports = router;
