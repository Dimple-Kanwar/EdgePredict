import { Request, Response } from 'express';
import { EthereumService } from '../services/blockchain.service';
import { AddRatingRequest, CreateChallengeRequest } from '../types/challenge.types';

export class ChallengeController {
    private ethereumService: EthereumService;

    constructor() {
        this.ethereumService = new EthereumService();
    }


    async createChallenge(req: Request, res: Response) {
        try {
            const { challengeId, name }: CreateChallengeRequest = req.body;
            const txHash = await this.ethereumService.createChallenge(challengeId, name);
            res.json({ success: true, txHash });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async addRating(req: Request, res: Response) {
        try {
            const { challengeId, rating, user, value }: AddRatingRequest = req.body;
            const txHash = await this.ethereumService.addRating(challengeId, rating, user, value);
            res.json({ success: true, txHash });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getChallenge(req: Request, res: Response) {
        try {
            const challengeId = Number(req.params.challengeId);
            const challenge = await this.ethereumService.getChallenge(challengeId);
            res.json({ success: true, challenge });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getRatings(req: Request, res: Response) {
        try {
            const challengeId = Number(req.params.challengeId);
            const ratings = await this.ethereumService.getRatings(challengeId);
            res.json({ success: true, ratings });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
