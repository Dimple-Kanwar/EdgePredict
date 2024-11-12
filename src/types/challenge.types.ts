export interface Challenge {
    id: number;
    expiry: number;
    totalShares: number;
    name: string;
    totalPenalities: number;
    totalRemainingShares: number;
    isExpired: boolean;
}

export interface Rating {
    user: string;
    rating: number;
    shares: string;
    rewards: string;
}

export interface AddRatingRequest {
    challengeId: number;
    rating: number;
    user: string;
    value: string; // Amount in wei
}

export interface CreateChallengeRequest {
    challengeId: number;
    name: string;
}