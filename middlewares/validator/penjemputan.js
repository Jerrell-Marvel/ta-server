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
