import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const loginRule = [
  { field: "username", displayName: "username" },
  { field: "password", displayName: "password" },
];
export const loginValidator = (req, res, next) => {
  validateObject(req.body, loginRule);

  next();
};
