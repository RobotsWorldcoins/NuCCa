// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/ContestEscrow.sol";

contract MockEscrowToken {
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

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[address(this)] >= amount, "balance");
        balanceOf[address(this)] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract ContestEscrowTest {
    function testFeeBpsDefault() public {
        ContestEscrow escrow = new ContestEscrow(IERC20Escrow(address(new MockEscrowToken())), address(11), address(12));
        require(escrow.platformBps() == 1000, "platform");
        require(escrow.monthlyLeagueReserveBps() == 1000, "league");
    }
}
