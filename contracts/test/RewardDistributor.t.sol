// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/RewardDistributor.sol";

contract MockRewardToken {
    mapping(address => uint256) public balanceOf;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[address(this)] >= amount, "balance");
        balanceOf[address(this)] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract RewardDistributorTest {
    function testDailyCapStartsAtZero() public {
        MockRewardToken token = new MockRewardToken();
        RewardDistributor distributor =
            new RewardDistributor(IERC20Reward(address(token)), address(0xBEEF), 100 ether);

        require(distributor.dailyCap() == 100 ether, "cap");
        require(distributor.claimedByDay(block.timestamp / 1 days) == 0, "claimed");
    }
}
