import { Request, Response, NextFunction } from 'express';
import { AddRatingRequest } from '../types/challenge.types';
import { ethers } from 'ethers';

export const validateAddRating = (req: Request, res: Response, next: NextFunction) => {
    const { challengeId, rating, user, value }: AddRatingRequest = req.body;

    if (!challengeId || !rating || !user || !value) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields' 
        });
    }

    if (rating < 0 || rating > 5) {
        return res.status(400).json({ 
            success: false, 
            error: 'Rating must be between 0 and 5' 
        });
    }

    if (!ethers.isAddress(user)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid user address' 
        });
    }

    next();
}