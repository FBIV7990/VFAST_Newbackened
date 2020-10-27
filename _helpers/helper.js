module.exports = { sanitizeFile, moveFile, paddNumber };

function sanitizeFile(file, cb, fileExts) {
  // Define the allowed extension
  //let fileExts = ['png', 'jpg', 'jpeg','mp4']
  console.log(file);
  // Check allowed extensions
  let isAllowedExt = fileExts.includes(
    file.originalname.split(".")[1].toLowerCase()
  );
  // Mime type must be an image
  let isAllowedMimeType =
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype == "application/pdf";
  //let isAllowedMimeType = file.mimetype.startsWith("video/")
  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displayed in frontend
    cb("Error:File type not allowed!");
  }
}

function moveFile(file, dir2) {
  return new Promise((resolve, reject) => {
    //include the fs, path modules
    var fs = require("fs");
    var path = require("path");

    //gets file name and adds it to dir2
    var f = path.basename(file);
    var dest = path.resolve(dir2, f);

    fs.rename(file, dest, (err) => {
      if (err) reject({ success: false, error: err });
      else {
        resolve({ success: true });
      }
    });
  });
}

function paddNumber(num) {
  var str = num.toString();
  return str.padStart(6, "0");
}
