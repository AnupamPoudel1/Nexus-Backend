import { Response } from "express";

interface Fields {
  [key: string]: any;
}

export default function validateFields(
  fields: Fields,
  res: Response
): void | Response {
  const missingFields = Object.entries(fields)
    .filter(([__, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ message: `Missing Fields: ${missingFields.join(", ")}` });
  }
}
