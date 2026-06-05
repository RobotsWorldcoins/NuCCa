// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Reward {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract RewardDistributor {
    IERC20Reward public immutable nucca;
    address public admin;
    address public signer;
    bool public paused;
    uint256 public dailyCap;
    mapping(uint256 => uint256) public claimedByDay;
    mapping(bytes32 => bool) public usedVoucher;

    event Claimed(address indexed user, uint256 amount, bytes32 voucherId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    constructor(IERC20Reward nucca_, address signer_, uint256 dailyCap_) {
        require(address(nucca_) != address(0), "token required");
        require(signer_ != address(0), "signer required");
        nucca = nucca_;
        signer = signer_;
        admin = msg.sender;
        dailyCap = dailyCap_;
    }

    function claim(uint256 amount, bytes32 voucherId, bytes calldata signature) external {
        require(!paused, "paused");
        uint256 day = block.timestamp / 1 days;
        claimedByDay[day] += amount;
        require(claimedByDay[day] <= dailyCap, "daily cap");
        require(!usedVoucher[voucherId], "used");
        bytes32 digest = keccak256(abi.encodePacked(address(this), msg.sender, amount, voucherId));
        require(_recover(digest, signature) == signer, "bad sig");
        usedVoucher[voucherId] = true;
        require(nucca.transfer(msg.sender, amount), "transfer failed");
        emit Claimed(msg.sender, amount, voucherId);
    }

    function setPaused(bool value) external onlyAdmin {
        paused = value;
    }

    function setSigner(address value) external onlyAdmin {
        require(value != address(0), "signer required");
        signer = value;
    }

    function setDailyCap(uint256 value) external onlyAdmin {
        dailyCap = value;
    }

    function _recover(bytes32 digest, bytes calldata signature) private pure returns (address) {
        require(signature.length == 65, "bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        return ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", digest)), v, r, s);
    }
}
