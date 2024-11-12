// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract RatingContract {

    // Challenge struct
    struct Challenge {
        string name;
        uint64 expiry;
        uint256 totalShares;
        uint256 totalPenalities;
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

    // define range for ratings
    uint256 public maxRange = 5;
    uint256 public minRange = 0;

    // challenge mapping
    mapping(uint256 => Challenge) public challenges;

    // challenge created event
    event ChallengeCreate(uint256, string, uint256);
    event ChallengeCompleted(uint256 _challengeId, uint256 _outcome, bool isExpired);
    event PaymentSettled(uint256 challengeId, address indexed user, uint256 payout);

    // Create a new challenge with initial shares as zero
    function createChallenge(uint256 challengeId, string memory _name, uint64 _expiry) public {
        Challenge memory _challenge = Challenge(_name,_expiry, 0, 0,0,false);
        challenges[challengeId] = _challenge;
        emit ChallengeCreate(challengeId, _name, _expiry);
    }

    // Add rating for a challenge
    function addRating(uint256 _challengeId, uint256 _rating, address user) public payable {
        Challenge memory _challenge = challenges[_challengeId];
        require(msg.value > 0, "You must send some Ether to rate the challenge");
        require(_challenge.expiry > block.timestamp, "Challenge expired");
        require((_rating <= maxRange), "Rating should be between 0 and 5");
        Rating[] storage _ratings = ratings[_challengeId];
         // Check if user already rated for the challenge
        bool userFound = false;
        for (uint256 i = 0; i < _ratings.length; i++) 
        {
            if (_ratings[i].user == user) {
                // User already rated, so just update the shares
                _ratings[i].shares += msg.value;
                ratings[_challengeId][i]=_ratings[i];
                userFound = true;
                break;
            }
            // first time rating, so just add new entry for rating
            Rating memory rating = Rating(user,_rating, msg.value, 0);
            // append rating
            ratings[_challengeId].push(rating);
        }


        // transfer bidding share to smart contract
        (bool success, ) = address(this).call{value: msg.value}("");
        console.log("success: ",success);
         // Update the challenge's total shares
        _challenge.totalShares += msg.value;
    }

    // Set outcome of a challenge
    function announceOutcome(uint256 _challengeId, uint256 _outcome) public {
        Challenge memory _challenge = challenges[_challengeId];
        require(_challenge.expiry > block.timestamp, "Challenge already expired");
        // set outcome
        outcome[_challengeId] = _outcome;
        _challenge.isExpired = true;
        challenges[_challengeId] = _challenge;
        emit ChallengeCompleted(_challengeId,_outcome, _challenge.isExpired);
    }

    // payment settlement once challenge is complete or outcome announced
    function settlePayments(uint256 _challengeId) public {
        Challenge memory _challenge = challenges[_challengeId];
        require(_challenge.isExpired == true, "Challenge is not expired yet");
        // get all ratings
        Rating[] storage _ratings = ratings[_challengeId];
        // get outcome
        uint256 _outcome = outcome[_challengeId];
        // calculate profit and loss for the users and get the list of winners
        for (uint256 i=0; i < _ratings.length; i++)
        {
            // difference between outcome and rating
            uint256 variance = (_outcome - _ratings[i].rate) / maxRange;
            console.log("variance: ",variance);
            //calculate penalties
            uint256 penality = _ratings[i].shares * variance;
            console.log("penality: ",penality);
            // total penality
            _challenge.totalPenalities = _challenge.totalPenalities + penality;
            console.log("_challenge.totalPenalities: ",_challenge.totalPenalities);
            // deduct penality from orginal bet
            _ratings[i].remainingShares = _ratings[i].shares - penality;
            console.log("_ratings[i].remainingShares: ",_ratings[i].remainingShares);
            _challenge.totalRemainingShares = _challenge.totalShares - _challenge.totalPenalities;
            console.log("_challenge.totalRemainingShares: ",_challenge.totalRemainingShares);
        }
        // update challenge
        challenges[_challengeId] = _challenge;

        // calculate earnings and payout
        for (uint256 i=0; i < _ratings.length; i++)
        {
            console.log("2nd loop");
            console.log("_ratings[i].remainingShares: ",_ratings[i].remainingShares);
            console.log("_challenge.totalRemainingShares: ",_challenge.totalRemainingShares);
            uint256 earning = (_ratings[i].remainingShares * _challenge.totalRemainingShares) / _challenge.totalRemainingShares;
            console.log("earning: ",earning);
            uint256 payout = _ratings[i].remainingShares + earning;
            console.log("payout: ",payout);
            // transfer the payouts to each user
            (bool success, ) = payable(_ratings[i].user).call{value: payout}("");
            console.log("success: ",success);
            emit PaymentSettled(_challengeId, _ratings[i].user, payout);
        }
        
    }

    receive() external payable {} // The contract can now receive Ether from other EOAs and Smart Contracts
}
