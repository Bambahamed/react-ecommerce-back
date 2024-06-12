const admin = require("../firebase");
const User = require("../models/user");

exports.authCheck = async (req, res, next) => {
  //   console.log(req.headers); //token
  //   next();
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken);
    /* console.log("FIREBASE USER IN AUTHCHECK", firebaseUser); */

    req.user = firebaseUser;
    console.log(req.user);
  } catch (err) {
    res.status(401).json({
      err: "Invalid or expired token",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  await exports.authCheck(req, res);
  const { email } = req.user;
  console.log(req.user);

  const adminUser = await User.findOne({ email }).exec();
  console.log(adminUser.role);

  if (adminUser.role !== "admin") {
    res.status(403).json({
      err: "Admin resource. Access Denied ",
    });
  } else {
    next();
  }
};

exports.auth = async (req, res, next) => {
  await exports.authCheck(req, res);
  const { email } = req.user;
  const authUser = await User.findOne({ email }).exec();
  if (!authUser) {
    res.status(403).json({
      err: "Admin resource. Access Denied 2 ",
    });
  } else {
    next();
  }
};
