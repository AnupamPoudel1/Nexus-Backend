import jwt, { JwtPayload } from "jsonwebtoken";

export default function jwtHelper(
  token: string,
  secret: string
): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded || typeof decoded !== "object") {
        return reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
}
