// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/NuccaSpendRouter.sol";

contract MockToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance");
        if (msg.sender != from) {
            require(allowance[from][msg.sender] >= amount, "allowance");
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockPermit2 is IPermit2 {
    function transferFrom(address, address, uint160, address) external pure {}
}

contract NuccaSpendRouterTest {
    function testDefaultSplit() public {
        MockToken token = new MockToken();
        NuccaSpendRouter router =
            new NuccaSpendRouter(
                IERC20(address(token)),
                new MockPermit2(),
                address(11),
                address(12),
                address(13),
                address(14)
            );

        (uint256 treasuryAmount, uint256 leagueAmount, uint256 aiAmount, uint256 rewardsAmount) =
            router.split(100 ether);

        require(treasuryAmount == 35 ether, "treasury");
        require(leagueAmount == 35 ether, "league");
        require(aiAmount == 15 ether, "ai");
        require(rewardsAmount == 15 ether, "rewards");
    }
}
