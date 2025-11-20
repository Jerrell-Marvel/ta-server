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

const changePasswordRule = [{ field: "password", displayName: "password" }];
export const changePasswordValidator = (req, res, next) => {
  validateObject(req.body, changePasswordRule);

  next();
};

const logoutRule = [{ field: "device_id", displayName: "device ID" }];

export const logoutValidator = (req, res, next) => {
  validateObject(logoutRule);
  next();
};
