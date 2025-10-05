import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createGuruRule = [
  { field: "username", displayName: "username" },
  { field: "password", displayName: "password" },
  { field: "nama", displayName: "nama" },
  { field: "notification_id", displayName: "notification ID" },
  { field: "nomor_telepon", displayName: "nomor telepon" },
];
export const createGuruValidator = (req, res, next) => {
  if (!req.file) {
    throw new BadRequestError("profile_picture must be included");
  }
  validateObject(req.body, createGuruRule);

  next();
};
