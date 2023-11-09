const jwt = require("jsonwebtoken");
const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader) {
    if (authHeader.includes(" ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = userId;
    } catch (err) {
      console.log("Token no válido:", err);
    }
  }

  next();
};

module.exports = jwtMiddleware;
