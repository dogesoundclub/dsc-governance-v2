pragma solidity ^0.5.6;

interface IDSCVote {
    
    event Propose(uint256 indexed proposalId, address indexed proposer, address nft, uint256[] mateIds);
    event VoteFor(uint256 indexed proposalId, address indexed voter, address nft, uint256[] mateIds);
    event VoteAgainst(uint256 indexed proposalId, address indexed voter, address nft, uint256[] mateIds);
    event Cancel(uint256 indexed proposalId);
    event Execute(uint256 indexed proposalId);

    function VOTING() view external returns (uint8);
    function CANCELED() view external returns (uint8);
    function RESULT_FOR() view external returns (uint8);
    function RESULT_AGAINST() view external returns (uint8);
    function RESULT_SAME() view external returns (uint8);
    
    function propose(

        string calldata title,
        string calldata summary,
        string calldata content,
        string calldata note,
        uint256 votePeriod,
        
        address nft,
        uint256[] calldata mateIds

    ) external returns (uint256 proposalId);

    function proposals(uint256 proposalId) external returns (
        address proposer,
        string memory title,
        string memory summary,
        string memory content,
        string memory note,
        uint256 blockNumber,
        uint256 votePeriod,
        bool canceled,
        bool executed
    );

    function proposalCount() view external returns (uint256);
    function mateVoted(uint256 proposalId, address nft, uint256 id) view external returns (bool);
    function voteFor(uint256 proposalId, address nft, uint256[] calldata mateIds) external;
    function voteAgainst(uint256 proposalId, address nft, uint256[] calldata mateIds) external;
    function getBacknft(uint256 proposalId) external;
    function nftBacked(uint256 proposalId) view external returns (bool);
    function cancel(uint256 proposalId) external;
    function execute(uint256 proposalId) external;
    function result(uint256 proposalId) view external returns (uint8);
}
