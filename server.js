const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const errorHandler = require("./_helpers/error-handler");
var http = require("http").createServer(app);
const morgan = require("morgan");

//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//create a write stream
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

//logger

app.use(morgan("combined", { stream: accessLogStream }));

// route
app.use("/", require("./controllers/main.controller"));
//error
app.use(errorHandler);

//port
const port =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4001;
http.listen(port, function () {
  console.log("listening on *:" + port);
});
