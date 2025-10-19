import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { logger } from '../config/logger';
import { IApiResponse } from '../types';

/**
 * Middleware to handle express-validator validation results
 * Sends a 400 response with validation errors if validation fails
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    logger.warn('Request validation failed:', {
      url: req.url,
      method: req.method,
      errors: errorMessages,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    const response: IApiResponse = {
      success: false,
      message: 'Validation failed',
      error: 'Invalid request data',
      meta: {
        validationErrors: errorMessages,
      },
    };

    res.status(400).json(response);
    return;
  }

  next();
};
