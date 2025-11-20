import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createSiswaRule = [{ field: "nama", displayName: "nama" }];
export const createSiswaValidator = (req, res, next) => {
  if (!req.file) {
    throw new BadRequestError("Profile picture harus ada.");
  }
  validateObject(req.body, createSiswaRule);

  next();
};
