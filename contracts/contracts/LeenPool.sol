// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LeenPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Config {
        IERC20 token; // Token used as collateral
        IERC20 stablecoin; // Token borrowed (USDC/USDT)
        uint256 interestRate; // Annual rate (500 = 5%)
        uint256 collateralRatio; // 150 = 150%
        uint256 liquidationRatio; //  120 = 120%
        address treasury; // Address that receives protocol fees
    }

    Config public config;
    uint256 public totalBorrowed;
    uint256 public totalLiquidity;
    uint256 public lastWithdrawTime;

    mapping(address => uint256) public collateral; // user collateral deposited
    mapping(address => uint256) public borrowed;

    constructor(
        address _token,
        address _stablecoin,
        uint256 _interestRate,
        uint256 _collateralRatio,
        uint256 _liquidationRatio,
        address _treasury
    ) Ownable(msg.sender) {
        config = Config({
            token: IERC20(_token),
            stablecoin: IERC20(_stablecoin),
            interestRate: _interestRate,
            collateralRatio: _collateralRatio,
            liquidationRatio: _liquidationRatio,
            treasury: _treasury
        });
    }

    function deposit(uint256 amount) external whenNotPaused {
        require(amount > 0, "Deposit amount must be greater than zero");
        totalLiquidity += amount;
        config.stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");

        uint256 requiredCollateral = (amount * config.collateralRatio) / 100;
        config.token.safeTransferFrom(
            msg.sender,
            address(this),
            requiredCollateral
        );

        collateral[msg.sender] += requiredCollateral;

        uint256 fee = (amount * 100) / 10000; // 1%
        borrowed[msg.sender] += amount;
        totalBorrowed += amount;

        config.stablecoin.safeTransfer(msg.sender, amount - fee);
        config.stablecoin.safeTransfer(config.treasury, fee);

        emit Borrowed(msg.sender, amount, fee);
    }

    function repay(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= borrowed[msg.sender], "Repay too much");

        borrowed[msg.sender] -= amount;
        totalBorrowed -= amount;

        config.stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        uint256 totalCollateral = collateral[msg.sender];
        uint256 totalDebt = borrowed[msg.sender] + amount;
        uint256 collateralToReturn = (totalCollateral * amount) / totalDebt;

        collateral[msg.sender] -= collateralToReturn;

        config.token.safeTransfer(msg.sender, collateralToReturn);

        emit Repaid(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        uint256 remaining = collateral[msg.sender] - amount;
        uint256 minRequired = (borrowed[msg.sender] * config.collateralRatio) /
            100;
        require(remaining >= minRequired, "Collateral too low");

        collateral[msg.sender] -= amount;
        config.token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawStable(
        uint256 amount
    ) external cooldown onlyOwner nonReentrant {
        uint256 available = config.stablecoin.balanceOf(address(this));
        require(amount <= available - totalBorrowed, "Insufficient reserves");

        config.stablecoin.safeTransfer(owner(), amount);
    }

    function liquidate(address user) external nonReentrant whenNotPaused {
        uint256 userCollateral = collateral[user];
        uint256 debt = borrowed[user];
        uint256 minCollateral = (debt * config.liquidationRatio) / 100;
        require(userCollateral < minCollateral, "Not liquidatable");

        uint256 penalty = (userCollateral * 5) / 100; // 5% penalty

        borrowed[user] = 0;
        collateral[user] = 0;
        totalBorrowed -= debt;

        config.token.safeTransfer(msg.sender, userCollateral - penalty);
        config.token.safeTransfer(config.treasury, penalty);
        emit Liquidated(user, msg.sender, userCollateral - penalty, penalty);
    }

    function getUserInfo(
        address user
    ) external view returns (uint256 deposited, uint256 debt) {
        return (collateral[user], borrowed[user]);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function sweep(address _token) external onlyOwner {
        require(_token != address(config.token), "Protected collateral");
        require(_token != address(config.stablecoin), "Protected stablecoin");
        IERC20(_token).safeTransfer(
            owner(),
            IERC20(_token).balanceOf(address(this))
        );
    }

    modifier cooldown() {
        require(
            block.timestamp >= lastWithdrawTime + 1 days,
            "Cooldown active"
        );
        _;
        lastWithdrawTime = block.timestamp;
    }

    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount, uint256 fee);
    event Repaid(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Liquidated(
        address indexed user,
        address indexed liquidator,
        uint256 seized,
        uint256 penalty
    );
}
