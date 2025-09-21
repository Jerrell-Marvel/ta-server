import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createGuruRule = [
  { field: "username", displayName: "username" },
  { field: "password", displayName: "password" },
  { field: "nama", displayName: "nama" },
  { field: "url_foto", displayName: "foto" },
  { field: "notification_id", displayName: "notification ID" },
  { field: "nomor_telepon", displayName: "nomor telepon" },
];
export const createGuruValidator = (req, res, next) => {
  validateObject(req.body, createGuruRule);

  next();
};
