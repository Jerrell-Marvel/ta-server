import { BadRequestError } from "../errors/BadRequestError.js";

export const validateObject = (obj, rules) => {
  for (const rule of rules) {
    const value = obj[rule.field];

    if (!value) {
      throw new BadRequestError(`Field '${rule.displayName}' harus ada.`);
    }
  }
};
