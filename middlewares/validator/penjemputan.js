import { BadRequestError } from "../../errors/BadRequestError.js";
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
