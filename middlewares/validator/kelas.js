import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createKelasRule = [
  { field: "nomor_kelas", displayName: "nomor kelas" },
  { field: "varian_kelas", displayName: "varian kelas" },
];
export const createKelasValidator = (req, res, next) => {
  if (req.siswa && Array.isArray(req.siswa)) {
    throw new BadRequestError("Peserta siswa harus array.");
  }
  validateObject(req.body, createKelasRule);

  next();
};
