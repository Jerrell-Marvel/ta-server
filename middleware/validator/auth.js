import { BadRequestError } from "../../errors/BadRequestError.js";

export const loginValidator = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || username.trim() === "" || !password) {
    throw new BadRequestError("Username and password are required.");
  }

  next();
};
