import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization; // req.headers.authorization: "Bearer TOKEN(i.e. fbvndfh...)"
  let token;

  // Check if token exists in Authorization header
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1]; // "Bearer TOKEN(i.e. fbvndfh...)"

      // Verify JWT(token)
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
          statusCode: 401,
        });
      }

      next();
    } catch (error) {
      console.error("log> ERROR Auth middleware error:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token has expired",
          statusCode: 401,
        });
      }

      return res.status(401).json({
        success: false,
        error: "Not authorized, token failed",
        statusCode: 401,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
      statusCode: 401,
    });
  }
};

export default verifyJwt;
