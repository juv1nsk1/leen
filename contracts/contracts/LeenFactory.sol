// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LeenPool.sol";

contract LeenFactory {
    address public owner;
    address public treasury;

    mapping(address => address) public tokenToPool;
    address[] public allPools;

    event PoolCreated(address indexed token, address pool);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _treasury) {
        owner = msg.sender;
        treasury = _treasury;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function createNewPool(
        address token,
        address stablecoin,
        uint256 interestRate,
        uint256 collateralRatio,
        uint256 liquidationRatio
    ) external returns (address pool) {
        require(tokenToPool[token] == address(0), "Pool already exists");

        LeenPool newPool = new LeenPool(
            token,
            stablecoin,
            interestRate,
            collateralRatio,
            liquidationRatio,
            treasury
        );

        pool = address(newPool);
        newPool.transferOwnership(msg.sender);

        tokenToPool[token] = pool;
        allPools.push(pool);

        emit PoolCreated(token, pool);
    }

    function getPools() external view returns (address[] memory) {
        return allPools;
    }

    function getPoolForToken(address token) external view returns (address) {
        return tokenToPool[token];
    }
}
