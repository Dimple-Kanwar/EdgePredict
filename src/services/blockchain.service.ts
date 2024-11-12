import { ethers } from 'ethers';
import { CONFIG } from '../config/config';
import { Challenge, Rating } from '../types/challenge.types';
import moment from 'moment';

const ABI = [
    "function addRating(uint256 _challengeId, uint256 _rating, address user) public payable",
    "function announceOutcome(uint256 _challengeId, uint256 _outcome) public",
    "function settlePayments(uint256 _challengeId) public",
    "function createChallenge(uint256 challengeId, string memory _name, uint64 _expiry) public",
    "function challenges(uint256) public view returns (uint256 expiry, uint256 totalShares)",
    "function ratings(uint256, uint256) public view returns (address user, uint256 rating, uint256 shares, uint256 rewards)"
];

export class EthereumService {
    provider: ethers.JsonRpcProvider;
    contract: ethers.Contract;
    wallet: ethers.Wallet;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY!, this.provider);
        this.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS!, ABI, this.wallet);
    }

    async createChallenge(challengeId: number, name: string): Promise<string> {
        try {
            const now = moment().valueOf();
            const expiry = now + (1 * 24 * 60 * 60 * 1000); // add days to current timestamp
            const tx = await this.contract.createChallenge(challengeId, name, expiry);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error: any) {
            throw new Error(`Failed to create challenge: ${error.message}`);
        }
    }

    async addBid(challengeId: number, rating: number, user: string, shares: string): Promise<string> {
        try {
            console.log("test")
            const tx = await this.contract.addRating(challengeId, rating, user, {
                value: ethers.parseEther(shares)
            });
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error: any) {
            throw new Error(`Failed to add rating: ${error.message}`);
        }
    }

    async announceOutcome(challengeId: number, outcome: number): Promise<string> {
        try {
            const tx = await this.contract.announceOutcome(challengeId, outcome);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error: any) {
            throw new Error(`Failed to announce outcome: ${error.message}`);
        }
    }

    async getChallenge(challengeId: number): Promise<Challenge> {
        try {
            const challenge = await this.contract.challenges(challengeId);
            return challenge;
        } catch (error: any) {
            throw new Error(`Failed to get challenge: ${error.message}`);
        }
    }

    async getRatings(challengeId: number): Promise<Rating[]> {
        try {
            const ratings: Rating[] = [];
            let index = 0;
            
            while (true) {
                try {
                    const rating = await this.contract.ratings(challengeId, index);
                    ratings.push({
                        user: rating.user,
                        rating: Number(rating.rating),
                        shares: ethers.formatEther(rating.shares),
                        rewards: ethers.formatEther(rating.rewards)
                    });
                    index++;
                } catch (error) {
                    break;
                }
            }
            
            return ratings;
        } catch (error: any) {
            throw new Error(`Failed to get ratings: ${error.message}`);
        }
    }
}