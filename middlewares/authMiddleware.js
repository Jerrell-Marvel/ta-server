import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export const authMiddleware = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!requiredRoles || requiredRoles.length === 0) {
        return next(new Error("Internal Server Error: No roles defined for this route."));
      }

      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new BadRequestError("Authorization header with Bearer token must be provided"));
      }

      const token = authHeader.split(" ")[1];

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (!requiredRoles.includes(payload.role)) {
        return next(new ForbiddenError("You do not have permission to access this resource"));
      }

      req.user = payload;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token has expired"));
      }
      return next(new UnauthorizedError("Invalid token"));
    }
  };
};
