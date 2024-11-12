import { Router } from 'express';
import { ChallengeController } from '../controllers/challenge.controller';

const router = Router();
const challengeController = new ChallengeController();
router.post('/challenge/create', challengeController.createChallenge);
router.post('/rating',  challengeController.addRating);
router.get('/challenge/:challengeId',  challengeController.getChallenge);
router.get('/ratings/:challengeId',  challengeController.getRatings);

export default router;