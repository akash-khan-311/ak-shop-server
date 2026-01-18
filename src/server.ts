import mongoose from 'mongoose'
import { Server } from 'http'
import app from './app'
import config from './app/config'
import seedSuperAdmin from './app/DB'

let server: Server

// Main function to initialize the app and connect to the database
async function main() {
  try {
    // Connect to NoSQL DB
    await mongoose.connect(config.mongo_database_url as string)
    console.log('Mongoose with MongoDB connected successfully')
    seedSuperAdmin()
    // starting the server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

main()

// Handling unhandled promise rejections
process.on(
  'unhandledRejection',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (reason: unknown, promise: Promise<unknown>) => {
    console.log('😡 Unhandled Rejection Detected:', reason)
    console.log('Shutting down server...')
    if (server) {
      server.close(() => {
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  }
)

// Handling uncaught exceptions
process.on('uncaughtException', () => {
  console.log('😡 Uncaught Exception is Detected. Shutting Down....')
  process.exit(1)
})
