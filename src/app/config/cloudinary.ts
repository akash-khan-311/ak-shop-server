import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') })

/**
 * Ensure environment variable is set
 * @param key - Environment variable key
 * @returns Environment variable value
 * @throws Error if environment variable is not set
 */
function ensureEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set.`)
  }
  return value
}
cloudinary.config({
  // Cloudinary configuration
  cloud_name: ensureEnv('CLOUDINARY_CLOUD_NAME'),
  api_key: ensureEnv('CLOUDINARY_API_KEY'),
  api_secret: ensureEnv('CLOUDINARY_API_SECRET'),
  secure: true
})
export { cloudinary }
