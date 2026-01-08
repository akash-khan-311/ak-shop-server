/* eslint-disable prettier/prettier */
import bcrypt from 'bcryptjs'

export const hashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}
