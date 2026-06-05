// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IPermit2 {
    function transferFrom(address from, address to, uint160 amount, address token) external;
}

contract NuccaSpendRouter {
    IERC20 public immutable nucca;
    IPermit2 public immutable permit2;
    address public treasury;
    address public monthlyLeagueReserve;
    address public aiReserve;
    address public rewardsReserve;
    address public admin;
    bool public paused;

    uint16 public treasuryBps = 4500;
    uint16 public monthlyLeagueReserveBps = 2500;
    uint16 public aiReserveBps = 1500;
    uint16 public rewardsBps = 1500;

    event Spent(address indexed user, uint256 amount, string sink);
    event Paused(bool paused);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    constructor(
        IERC20 nucca_,
        IPermit2 permit2_,
        address treasury_,
        address monthlyLeagueReserve_,
        address aiReserve_,
        address rewardsReserve_
    ) {
        require(address(nucca_) != address(0), "token required");
        require(address(permit2_) != address(0), "permit2 required");
        require(treasury_ != address(0), "treasury required");
        require(monthlyLeagueReserve_ != address(0), "league reserve required");
        require(aiReserve_ != address(0), "ai reserve required");
        require(rewardsReserve_ != address(0), "rewards required");
        nucca = nucca_;
        permit2 = permit2_;
        treasury = treasury_;
        monthlyLeagueReserve = monthlyLeagueReserve_;
        aiReserve = aiReserve_;
        rewardsReserve = rewardsReserve_;
        admin = msg.sender;
    }

    function spendWithApproval(uint256 amount, string calldata sink) external {
        require(!paused, "paused");
        require(amount > 0, "amount required");

        (uint256 treasuryAmount, uint256 leagueAmount, uint256 aiAmount, uint256 rewardsAmount) =
            split(amount);

        require(nucca.transferFrom(msg.sender, treasury, treasuryAmount), "treasury transfer failed");
        require(nucca.transferFrom(msg.sender, monthlyLeagueReserve, leagueAmount), "league transfer failed");
        require(nucca.transferFrom(msg.sender, aiReserve, aiAmount), "ai transfer failed");
        require(nucca.transferFrom(msg.sender, rewardsReserve, rewardsAmount), "rewards transfer failed");

        emit Spent(msg.sender, amount, sink);
    }

    function spendWithPermit2(uint160 amount, string calldata sink) external {
        require(!paused, "paused");
        require(amount > 0, "amount required");

        (uint256 treasuryAmount, uint256 leagueAmount, uint256 aiAmount, uint256 rewardsAmount) =
            split(amount);

        permit2.transferFrom(msg.sender, treasury, uint160(treasuryAmount), address(nucca));
        permit2.transferFrom(msg.sender, monthlyLeagueReserve, uint160(leagueAmount), address(nucca));
        permit2.transferFrom(msg.sender, aiReserve, uint160(aiAmount), address(nucca));
        permit2.transferFrom(msg.sender, rewardsReserve, uint160(rewardsAmount), address(nucca));

        emit Spent(msg.sender, amount, sink);
    }

    function split(uint256 amount)
        public
        view
        returns (uint256 treasuryAmount, uint256 leagueAmount, uint256 aiAmount, uint256 rewardsAmount)
    {
        treasuryAmount = amount * treasuryBps / 10_000;
        leagueAmount = amount * monthlyLeagueReserveBps / 10_000;
        aiAmount = amount * aiReserveBps / 10_000;
        rewardsAmount = amount - treasuryAmount - leagueAmount - aiAmount;
        return (treasuryAmount, leagueAmount, aiAmount, rewardsAmount);
    }

    function setPaused(bool value) external onlyAdmin {
        paused = value;
        emit Paused(value);
    }

    function setSplits(uint16 treasury_, uint16 league_, uint16 ai_, uint16 rewards_) external onlyAdmin {
        require(treasury_ + league_ + ai_ + rewards_ == 10_000, "bad split");
        treasuryBps = treasury_;
        monthlyLeagueReserveBps = league_;
        aiReserveBps = ai_;
        rewardsBps = rewards_;
    }
}
