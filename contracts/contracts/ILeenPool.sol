// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILeenPool {
    function deposit(uint256 amount) external;
    function borrow(uint256 amount) external;
    function repay(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function liquidate(address user) external;
    function getUserInfo(
        address user
    ) external view returns (uint256 deposited, uint256 debt);

    function config()
        external
        view
        returns (
            address token,
            address stablecoin,
            uint256 interestRate,
            uint256 collateralRatio,
            uint256 liquidationRatio,
            address treasury
        );

    function totalBorrowed() external view returns (uint256);
    function totalDeposits() external view returns (uint256);
    function deposits(address user) external view returns (uint256);
    function borrowed(address user) external view returns (uint256);
}
