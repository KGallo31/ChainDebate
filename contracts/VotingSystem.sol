// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract VotingSystem is ReentrancyGuard, Initializable {
    
    // Struct to represent a Voter's details in a specific session
    struct Voter {
        address userID;
        bool hasVoted;      // To check if the voter has already voted
        uint32 vote;          // The ID of the topic the voter voted for
        bytes32[] votedForTopics;
    }

    // Struct to represent a Topic for voting in each session
    struct Topic {
        bytes32 id;            // ID of the topic
        string description; // Description of the topic
        uint32 voteCount;     // Number of votes for the topic
    }

    // Struct to represent a voting session
    struct VotingSession {
        string title;
        uint256 startTime;
        uint256 endTime;
        Voter[] votedUsers; // Array of users that have voted
        Topic[] votingTopics; // Araay of topics to be voted
        address creator;    // The address of the user who created the session
        uint32 totalVotes;
    }

    struct VotingSessionInfo {
        bytes32 sessionId;
        string title;
        uint256 startTime;
        uint256 endTime;
        address creator;
        uint32 totalVotes;
        bool isActive;
    }

    event VotingSessionCreated(bytes32 sessionId, string title, uint256 startTime, uint256 endTime, address creator, uint32 totalVotes);

    // Mapping from user to the last session they created and the timestamp
    mapping(address => uint256) public lastSessionCreationTime;
    // Mapping from session ID to the VotingSession struct
    mapping(bytes32 => VotingSession) public votingSessions;
    // Counter to keep track of the total number of voting sessions created
    uint32 public totalSessions;

    address public owner;

    function initialize(address _owner, uint32 _totalSession, address[] usersLastCreationTimeAddress, uint256[] usersLastCreationTime, bytes32[] votingSessionKeys, VotingSession[] _votingSessions) public initializer {
    }

    // Modifier to check if the user can create a session (once every 24 hours)
    modifier canCreateSession() {
        require(
            block.timestamp >= lastSessionCreationTime[msg.sender] + 24 hours,
            "You can only create one session every 24 hours"
        );
        _;
    }

    // Modifier to check if a voting session is still active
    modifier withinVotingPeriod(bytes32 _sessionId) {
        require(block.timestamp < votingSessions[_sessionId].endTime, "Voting period is over");
        _;
    }

    // Function to create a new voting session
    function createVotingSession(uint32 _votingDurationInMinutes, string[] memory _topicDescriptions, string memory _title) public canCreateSession returns (bytes32) {
        // Generate a unique session ID using keccak256 (combining creator address, timestamp, and topics)
        bytes32 sessionId = keccak256(abi.encodePacked(msg.sender, block.timestamp));

        VotingSession storage newSession = votingSessions[sessionId];  // Create a new voting session
        newSession.title = _title;
        newSession.startTime = block.timestamp;  // Set the start time
        newSession.endTime = block.timestamp + (_votingDurationInMinutes * 1 minutes);  // Set the end time
        newSession.creator = msg.sender;  // Set the creator of the session

        // Add topics to the voting session
        for (uint32 i = 0; i < _topicDescriptions.length; i++) {
            newSession.topics[i] = Topic({
                id: i,
                description: _topicDescriptions[i],
                voteCount: 0
            });
        }
        totalSessions++;
        lastSessionCreationTime[msg.sender] = block.timestamp;  // Update the user's last session creation time

        emit VotingSessionCreated(sessionId, _title, newSession.startTime, newSession.endTime, msg.sender, newSession.totalVotes);

        return sessionId;
    }

    function getSessionInfo(bytes32 _sessionId) public view returns (VotingSessionInfo memory) {
        require(totalSessions > 0, "No sessions created yet"); 
        require(votingSessions[_sessionId].creator != address(0) && keccak256(bytes(votingSessions[_sessionId].title)) != keccak256(bytes("")), "Session does not exist");
        VotingSession storage session = votingSessions[_sessionId];
        bool isActive = block.timestamp < session.endTime;
        return VotingSessionInfo({
            sessionId: _sessionId,
            title: session.title,
            startTime: session.startTime,
            endTime: session.endTime,
            creator: session.creator,
            totalVotes: session.totalVotes,
            isActive: isActive
        });
    }

    // Function to vote in a specific session
    function vote(bytes32 _sessionId, uint32 _topicId) public nonReentrant withinVotingPeriod(_sessionId) {
        VotingSession storage session = votingSessions[_sessionId];
        Voter storage voter = session.voters[msg.sender];
        
        require(!voter.hasVoted, "You have already voted in this session");
        require(!isTopicDefault(session.topics[_topicId]), "Invalid topic ID");  // Add extra check to avoid out-of-bounds errors
        
        // Update in memory
        voter.hasVoted = true;
        voter.vote = _topicId;
        
        // Cache topic and increment its vote count
        Topic storage selectedTopic = session.topics[_topicId];
        selectedTopic.voteCount += 1;
        
        // Update total votes
        session.totalVotes += 1;
    }

    // Function to get the total number of votes for a specific session (for frontend display)
    function getTotalVotesForSession(bytes32 _sessionId) public view returns (uint32) {
        return votingSessions[_sessionId].totalVotes;
    }

    // Function to get information about a specific topic in a session
    function getTopic(bytes32 _sessionId, uint32 _topicId) public view returns (Topic memory) {
        require(votingSessions[_sessionId].creator != address(0) && keccak256(bytes(votingSessions[_sessionId].title)) != keccak256(bytes("")), "Session does not exist");
        Topic memory topic = votingSessions[_sessionId].topics[_topicId];  // Fetch the topic in the session
        return topic;
    }

    // Function to check how much time is left in a specific voting session
    // function votingTimeLeft(bytes32 _sessionId) public nonReentrant returns (uint256) {
    //     if (block.timestamp >= votingSessions[_sessionId].endTime) {
    //         return 0;  // If the current time is past the voting end time, return 0
    //     } else {
    //         return votingSessions[_sessionId].endTime - block.timestamp;  // Return the remaining time
    //     }
    // }

    // Function to determine which topic received the most votes in a session
    function winner(bytes32 _sessionId) public view returns (string memory winningTopicDescription) {
        VotingSession storage session = votingSessions[_sessionId];
        uint32 maxVotes = 0;
        string memory winningTopic;

        Topic memory topic = session.topics[0];
        while (!isTopicDefault(topic)) {
            if (session.topics[topic.id].voteCount > maxVotes) {
                maxVotes = session.topics[topic.id].voteCount;
                winningTopic = session.topics[topic.id].description;
            }
            topic = session.topics[topic.id + 1];
        }

        return winningTopic;  // Return the description of the topic with the most votes
    }

    // Function to check if a topic is the default value
    function isTopicDefault(Topic memory topic) internal pure returns (bool) {
        return topic.id == 0 && keccak256(bytes(topic.description)) == keccak256(bytes("")) && topic.voteCount == 0;
    }
}
