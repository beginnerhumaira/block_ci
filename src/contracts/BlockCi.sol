// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16;
//pragma solidity ^0.8.0;

contract BlockCi {
    struct Campaign {
        address organizer;
        string title;
        uint goalAmount;
        uint totalDonations;
        uint startDate;
        uint endDate;
        uint[] milestones;
        uint currentMilestone;
        bool isClosed;
        bool initialReleaseDone; // state variable to track whether the initial release has been done
        mapping(address => uint) donations; // Mapping to track individual donor contributions
    }

    struct Vote {
        address voter;
        bool inFavor;
    }

    Campaign[] public campaigns;
    mapping(uint => Vote[]) public votes;

    event CampaignCreated(
        uint campaignId,
        address organizer,
        string title,
        uint goalAmount
    );
    event DonationMade(uint campaignId, address donor, uint amount);
    event VoteCasted(uint campaignId, address voter, bool inFavor);
    event CampaignClosed(uint campaignId);

    modifier campaignOpen(uint campaignId) {
        require(!campaigns[campaignId].isClosed, "Campaign is closed");
        _;
    }

    function createCampaign(
        string memory title,
        uint goalAmount,
        uint endDate,
        uint[] memory milestones
    ) external {
        require(
            milestones.length >= 3,
            "At least three milestones are required"
        );
        require(endDate > block.timestamp, "End date must be in the future");

        uint campaignId = campaigns.length;

        // Initialize the campaign directly in storageorganizer = msg.sender;
        campaigns.push();
        Campaign storage newCampaign = campaigns[campaignId];
        newCampaign.organizer = msg.sender;
        newCampaign.title = title;
        newCampaign.goalAmount = goalAmount;
        newCampaign.startDate = block.timestamp;
        newCampaign.endDate = endDate;
        newCampaign.currentMilestone = 0;
        newCampaign.isClosed = false;
        
        newCampaign.initialReleaseDone = false; // Initialize initialReleaseDone to false

        emit CampaignCreated(campaignId, msg.sender, title, goalAmount);
    }

    function makeDonation(
        uint campaignId
    ) external payable campaignOpen(campaignId) {
        require(msg.value > 0, "Donation amount must be greater than 0");

        Campaign storage campaign = campaigns[campaignId];
        campaign.donations[msg.sender] += msg.value;
        campaign.totalDonations += msg.value;

        emit DonationMade(campaignId, msg.sender, msg.value);

        // Check if the total donations have reached or exceeded 25% of the goal amount and initial release has not been done
        if (
            campaign.totalDonations >= (campaign.goalAmount * 25) / 100 &&
            !campaign.initialReleaseDone
        ) {
            // Release 25% of the goal amount as initial capital
            uint initialRelease = (campaign.goalAmount * 25) / 100;
            payable(campaign.organizer).transfer(initialRelease);

            // Mark initial release as done
            campaign.initialReleaseDone = true;
        }
    }

    function castVote(
        uint campaignId,
        bool inFavor
    ) external campaignOpen(campaignId) {
        require(
            campaigns[campaignId].donations[msg.sender] > 0,
            "Only donors can vote"
        );

        // Randomly select 10% of donors to vote
        if (
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) %
                10 ==
            0
        ) {
            Vote memory newVote = Vote({voter: msg.sender, inFavor: inFavor});

            votes[campaignId].push(newVote);

            emit VoteCasted(campaignId, msg.sender, inFavor);
        }
    }

    function closeCampaign(uint campaignId) external campaignOpen(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(
            msg.sender == campaign.organizer,
            "Only the organizer can close the campaign"
        );

        uint inFavorCount;
        uint againstCount;

        // Count the votes
        for (uint i = 0; i < votes[campaignId].length; i++) {
            if (votes[campaignId][i].inFavor) {
                inFavorCount++;
            } else {
                againstCount++;
            }
        }

        // If the majority is in favor, release funds for the current milestone
        if (inFavorCount > againstCount) {
            // Release funds for the current milestone based on milestones
            uint releaseAmount = (campaign.goalAmount *
                (100 -
                    ((campaign.milestones.length -
                        campaign.currentMilestone -
                        1) * 25))) / 100;
            payable(campaign.organizer).transfer(releaseAmount);
            campaign.currentMilestone++;

            // If all milestones are completed, close the campaign
            if (campaign.currentMilestone == campaign.milestones.length) {
                campaign.isClosed = true;
                emit CampaignClosed(campaignId);
            }
        }

        // If end date is reached, close the campaign
        if (block.timestamp >= campaign.endDate) {
            campaign.isClosed = true;
            emit CampaignClosed(campaignId);
        }
    }
}
