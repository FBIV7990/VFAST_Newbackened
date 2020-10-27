module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  console.log(err);
  if (typeof err === "string") {
    // custom application error
    return res.status(400).json({ code: 400, success: false, message: err });
  }

  if (err.name === "ValidationError") {
    // mongoose validation error
    return res
      .status(400)
      .json({ code: 400, success: false, message: err.message });
  }

  // if(err.req){
  //   return req.status(400).json({code:401,success:false,message:err})
  // }

  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return res
      .status(401)
      .json({ code: 401, success: false, message: "Invalid Token" });
  }

  // default to 500 server error
  return res
    .status(500)
    .json({ code: 500, success: false, message: err.message });
}
