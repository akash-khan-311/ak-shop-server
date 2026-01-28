/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import { ZodTypeAny, ZodError } from 'zod'
import catchAsync from '../utils/catchAsync'

const validateRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies
      })
      next()
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: 'Validation Error',
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
      }

      return res.status(500).json({
        status: 500,
        success: false,
        message: 'Internal Server Error',
        error: err.message || err
      })
    }
  })
}

export default validateRequest
