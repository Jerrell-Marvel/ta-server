import { BadRequestError } from "../../errors/BadRequestError.js";
import { isValidDate } from "../../utils/dateValidator.js";
import { validateObject } from "../../utils/validateObject.js";

const updateStatusPenjemputRule = [{ field: "status", displayName: "status" }];
export const updateStatusPenjemputanValidator = (req, res, next) => {
  validateObject(req.body, updateStatusPenjemputRule);

  const { status } = req.body;
  if (status !== "sudah dekat" && status !== "menunggu penjemputan") {
    throw new BadRequestError("Invalid status.");
  }

  next();
};

const required = ["id_penjemput", "exp", "device_id", "device_name", "is_insidental"];
const qrCodeDataRule = [
  { field: "id_penjemput", displayName: "id penjemput" },

  { field: "exp", displayName: "exp" },
  { field: "device_id", displayName: "device id" },
  { field: "device_name", displayName: "device name" },
  { field: "is_insidental", displayName: "is insidental" },
];
export const verifyPenjemputanValidator = (req, res, next) => {
  const { qr_code_string } = req.body;

  let qrCodeData;
  try {
    qrCodeData = JSON.parse(qr_code_string);
    validateObject(qrCodeData, qrCodeDataRule);
  } catch (err) {
    throw new BadRequestError("Format QR Code tidak valid.");
  }

  req.body.qrCodeData = qrCodeData;
  next();
};

export const validateHistory = (req, res, next) => {
  const { page, limit, search, status, tanggal } = req.query;
  if (status) {
    const allowedStatuses = ["selesai", "penjemputan insidental", "tidak dijemput", "belum ada data penjemputan"];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestError(`Status tidak valid untuk history. Pilihan: ${allowedStatuses.join(", ")}`);
    }
  }

  if (!isValidDate(tanggal)) {
    throw new BadRequestError("Format tanggal tidak valid.");
  }

  next();
};
