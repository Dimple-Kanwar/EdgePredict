// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract RatingContract {
    address public owner;

    // Challenge struct
    struct Challenge {
        string name;
        uint64 expiry;
        uint256 totalShares;
        uint256 totalPenalties;
        uint256 totalRemainingShares;
        bool isExpired;
    }

    // Rating struct
    struct Rating {
        address user;
        uint256 rate;
        uint256 shares;
        uint256 remainingShares;
    }

    mapping(uint256 => Rating[]) public ratings;
    mapping(uint256 => uint256) public outcome;
    // New mapping to track if user has already rated a challenge
    mapping(uint256 => mapping(address => bool)) public hasRated;
    mapping(uint256 => mapping(address => uint256)) public userRatingIndex;

    uint256 public maxRange = 5;
    uint256 public minRange = 0;

    mapping(uint256 => Challenge) public challenges;

    event ChallengeCreated(uint256 challengeId, string name, uint256 expiry);
    event RatingAdded(
        uint256 _challengeId,
        uint256 _rating,
        address user,
        uint256 shares
    );
    event OutcomeAnnounced(
        uint256 _challengeId,
        uint256 _outcome,
        bool isExpired
    );
    event PaymentSettled(
        uint256 challengeId,
        address indexed user,
        uint256 payout
    );

    constructor() {
        owner = msg.sender;
    }

    function createChallenge(
        uint256 challengeId,
        string memory _name,
        uint64 _expiry
    ) public {
        require(_expiry > block.timestamp, "Expiry must be in the future");
        require(bytes(_name).length > 0, "Name cannot be empty");

        Challenge memory _challenge = Challenge(_name, _expiry, 0, 0, 0, false);
        challenges[challengeId] = _challenge;
        emit ChallengeCreated(challengeId, _name, _expiry);
    }

    function addRating(
        uint256 _challengeId,
        uint256 _rating,
        address user,
        uint256 shares
    ) public payable {
        Challenge storage _challenge = challenges[_challengeId];
        require(msg.value == shares, "Sent value must match shares amount");
        require(shares > 0, "You must send some Ether to rate the challenge");
        require(_challenge.expiry > block.timestamp, "Challenge expired");
        require(
            _rating <= maxRange && _rating >= minRange,
            "Rating should be between 0 and 5"
        );
        require(!_challenge.isExpired, "Challenge is already expired");

        if (hasRated[_challengeId][user]) {
            // Update existing rating
            uint256 index = userRatingIndex[_challengeId][user];
            ratings[_challengeId][index].shares += shares;
            // ratings[_challengeId][index].remainingShares += shares;
        } else {
            // Add new rating
            Rating memory rating = Rating(user, _rating, shares, shares);
            ratings[_challengeId].push(rating);
            hasRated[_challengeId][user] = true;
            userRatingIndex[_challengeId][user] =
                ratings[_challengeId].length -
                1;
        }

        // Update challenge total shares
        _challenge.totalShares += shares;
        // _challenge.totalRemainingShares += shares;

        emit RatingAdded(_challengeId, _rating, user, shares);
    }

    function announceOutcome(uint256 _challengeId, uint256 _outcome) public {
        require(msg.sender == owner, "Only owner can announce outcome");
        Challenge storage _challenge = challenges[_challengeId];
        require(!_challenge.isExpired, "Challenge already expired");
        require(
            _outcome <= maxRange && _outcome >= minRange,
            "Outcome should be between 0 and 5"
        );

        outcome[_challengeId] = _outcome;
        _challenge.isExpired = true;

        emit OutcomeAnnounced(_challengeId, _outcome, true);
    }

    function settlePayments(uint256 _challengeId) public returns (bool) {
        Challenge storage _challenge = challenges[_challengeId];
        require(_challenge.isExpired, "Challenge is not expired yet");
        require(_challenge.totalShares > 0, "No shares to settle");

        Rating[] storage _ratings = ratings[_challengeId];
        uint256 _outcome = outcome[_challengeId];

        // First pass: Calculate penalties
        for (uint256 i = 0; i < _ratings.length; i++) {
            uint256 ratingDiff;
            if (_ratings[i].rate > _outcome) {
                ratingDiff = _ratings[i].rate - _outcome;
            } else {
                ratingDiff = _outcome - _ratings[i].rate;
            }

            // Calculate penalty as a percentage based on rating difference
            uint256 penaltyPercentage = (ratingDiff * 100) / maxRange;
            uint256 penalty = (_ratings[i].shares * penaltyPercentage) / 100;

            _challenge.totalPenalties += penalty;
            _ratings[i].remainingShares = _ratings[i].shares - penalty;
        }

        // Update total remaining shares after penalties
        _challenge.totalRemainingShares =
            _challenge.totalShares -
            _challenge.totalPenalties;

        // Second pass: Distribute penalties proportionally
        if (_challenge.totalRemainingShares > 0) {
            for (uint256 i = 0; i < _ratings.length; i++) {
                if (_ratings[i].remainingShares > 0) {
                    // Calculate bonus from penalty pool
                    uint256 share = (_ratings[i].remainingShares *
                        _challenge.totalPenalties) /
                        _challenge.totalRemainingShares;
                    uint256 payout = _ratings[i].remainingShares + share;

                    // Transfer payout
                    (bool success, ) = payable(_ratings[i].user).call{
                        value: payout
                    }("");
                    require(success, "Transfer failed");

                    emit PaymentSettled(_challengeId, _ratings[i].user, payout);
                }
            }
        }

        return true;
    }

    receive() external payable {}
}
