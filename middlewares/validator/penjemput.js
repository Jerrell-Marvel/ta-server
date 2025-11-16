import { BadRequestError } from "../../errors/BadRequestError.js";
import { validateObject } from "../../utils/validateObject.js";

const createPenjemputRule = [
  { field: "username", displayName: "username" },
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

export const addPublicKey = async (req, res, next) => {
  const { id_penjemput } = req.user;
  const { public_key, device_id, device_name } = req.body;

  const updatedPenjemput = await penjemputService.addPublicKey(id_penjemput, { public_key, device_id, device_name });

  return res.status(200).json({ success: true });
};

const addPublicKeyRules = [
  { field: "public_key", displayName: "public_key" },
  { field: "device_id", displayName: "device_id" },
  { field: "device_name", displayName: "device_name" },
];
export const addPublicKeyValidator = (req, res, next) => {
  validateObject(req.body, addPublicKeyRules);

  next();
};
