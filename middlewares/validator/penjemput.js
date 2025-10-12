import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createPenjemputRule = [
  { field: "username", displayName: "username" },
  { field: "password", displayName: "password" },
  { field: "id_siswa", displayName: "id_siswa" },
  { field: "nama", displayName: "nama" },
];
export const createPenjemputValidator = (req, res, next) => {
  if (!req.file) {
    throw new BadRequestError("profile_picture must be included");
  }
  validateObject(req.body, createPenjemputRule);

  next();
};
