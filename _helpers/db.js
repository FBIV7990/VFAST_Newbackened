const config = require("../config/database.config");
const mongoose = require("mongoose");

const connect = mongoose.connect(config.url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(`connection ${connect.host}`);

mongoose.Promise = global.Promise;

module.exports = {
  User: require("../models/user.model"),
  Control: require("../models/control.model"),
};
