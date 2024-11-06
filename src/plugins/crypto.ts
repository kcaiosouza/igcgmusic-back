import { AES, enc } from "crypto-js";

interface encodeTokenProps {
  userId: string,
  username: string,
}

interface decodeTokenProps {
  token: string,
}

export function encodeToken({userId, username}: encodeTokenProps) {
  const uncryptedToken = `${userId}&&%@${username}`
  const encryptedToken = AES.encrypt(uncryptedToken, process.env.SECRET_CRYPTO as string).toString()
  return {
    error: false,
    token: encryptedToken,
  }
}

export function decodeToken({ token }: decodeTokenProps) {
  const uncryptedBytesToken = AES.decrypt(token, process.env.SECRET_CRYPTO as string)
  const uncryptedToken = uncryptedBytesToken.toString(enc.Utf8)
  const splitedToken = uncryptedToken.split("&&%@")
  
  if(splitedToken.length != 2) {
    return {
      error: 401,
      message: "Invalid token",
      token: null,
    }
  }

  return {
    error: false,
    token: splitedToken,
  }
}