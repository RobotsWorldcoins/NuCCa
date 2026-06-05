// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Escrow {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract ContestEscrow {
    struct Contest {
        address creatorA;
        address creatorB;
        uint256 deposit;
        uint64 deadline;
        bool joined;
        bool resolved;
    }

    IERC20Escrow public immutable nucca;
    address public admin;
    address public treasury;
    address public monthlyLeagueReserve;
    uint16 public platformBps = 1800;
    uint16 public monthlyLeagueReserveBps = 700;
    uint256 public nextContestId = 1;
    mapping(uint256 => Contest) public contests;

    event ContestCreated(uint256 indexed id, address creatorA, address creatorB, uint256 deposit);
    event ContestResolved(uint256 indexed id, address winner);
    event ContestRefunded(uint256 indexed id);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    constructor(IERC20Escrow nucca_, address treasury_, address monthlyLeagueReserve_) {
        require(address(nucca_) != address(0), "token required");
        require(treasury_ != address(0), "treasury required");
        require(monthlyLeagueReserve_ != address(0), "league reserve required");
        nucca = nucca_;
        treasury = treasury_;
        monthlyLeagueReserve = monthlyLeagueReserve_;
        admin = msg.sender;
    }

    function createContest(address creatorB, uint256 deposit, uint64 deadline) external returns (uint256 id) {
        require(creatorB != address(0) && creatorB != msg.sender, "bad opponent");
        require(deposit > 0, "deposit required");
        require(deadline > block.timestamp, "bad deadline");
        id = nextContestId++;
        contests[id] = Contest(msg.sender, creatorB, deposit, deadline, false, false);
        require(nucca.transferFrom(msg.sender, address(this), deposit), "creator A transfer failed");
        emit ContestCreated(id, msg.sender, creatorB, deposit);
    }

    function joinContest(uint256 id) external {
        Contest storage contest = contests[id];
        require(msg.sender == contest.creatorB, "not opponent");
        require(block.timestamp < contest.deadline, "expired");
        require(!contest.joined, "joined");
        contest.joined = true;
        require(nucca.transferFrom(msg.sender, address(this), contest.deposit), "creator B transfer failed");
    }

    function resolve(uint256 id, address winner) external onlyAdmin {
        Contest storage contest = contests[id];
        require(!contest.resolved, "resolved");
        require(contest.joined, "not joined");
        require(winner == contest.creatorA || winner == contest.creatorB, "bad winner");
        contest.resolved = true;
        uint256 total = contest.deposit * 2;
        uint256 platformAmount = total * platformBps / 10_000;
        uint256 leagueAmount = total * monthlyLeagueReserveBps / 10_000;
        uint256 payout = total - platformAmount - leagueAmount;
        require(nucca.transfer(treasury, platformAmount), "treasury failed");
        require(nucca.transfer(monthlyLeagueReserve, leagueAmount), "league failed");
        require(nucca.transfer(winner, payout), "payout failed");
        emit ContestResolved(id, winner);
    }

    function refund(uint256 id) external {
        Contest storage contest = contests[id];
        require(!contest.resolved, "resolved");
        require(block.timestamp > contest.deadline, "not expired");
        contest.resolved = true;
        require(nucca.transfer(contest.creatorA, contest.deposit), "refund failed");
        if (contest.joined) {
            require(nucca.transfer(contest.creatorB, contest.deposit), "opponent refund failed");
        }
        emit ContestRefunded(id);
    }
}
