const { expect } = require("chai");

describe("LeenPool", function () {
  let Token, Stable, token, stable, pool, owner, user;

  beforeEach(async () => {
    [owner, user, treasury] = await ethers.getSigners();

    Token = await ethers.getContractFactory("MockERC20");
    Stable = await ethers.getContractFactory("MockERC20");

    token = await Token.deploy("TestToken", "TTK", 18);
    stable = await Stable.deploy("Stablecoin", "STBL", 18);
    await token.waitForDeployment();

    const LeenPool = await ethers.getContractFactory("contracts/LeenPool.sol:LeenPool");

    pool = await LeenPool.deploy(
      token.target,
      stable.target,
      500,
      150,
      120,
      treasury.address
    );

    await stable.mint(owner.address, ethers.parseEther("5000"));
    await stable.connect(owner).approve(pool.target, ethers.parseEther("5000"));
    await pool.connect(owner).deposit(ethers.parseEther("5000"));

    await token.mint(user.address, ethers.parseEther("1000"));
  });

  it("should allow deposit and track balance", async () => {
    const poolStableBalance = await stable.balanceOf(pool.target);
    expect(poolStableBalance).to.equal(ethers.parseEther("5000"));
  });

  it("should allow borrowing within collateral ratio", async () => {
    await token.connect(user).approve(pool.target, ethers.parseEther("150"));
    await pool.connect(user).borrow(ethers.parseEther("1"));

    const [, debt] = await pool.getUserInfo(user.address);
    expect(debt).to.equal(ethers.parseEther("1"));
  });

  it("should prevent over-borrowing", async () => {
    await token.connect(user).approve(pool.target, ethers.parseEther("100"));

    await expect(
      pool.connect(user).borrow(ethers.parseEther("100"))
    ).to.be.reverted
  });

  it("should apply 1% fee on borrow", async () => {
    await token.connect(user).approve(pool.target, ethers.parseEther("150"));

    const initialTreasury = await stable.balanceOf(treasury.address);

    await pool.connect(user).borrow(ethers.parseEther("100"));

    const newTreasury = await stable.balanceOf(treasury.address);
    expect(newTreasury - initialTreasury).to.equal(ethers.parseEther("1")); // 1% of 100
  });

  it("should allow repay and reduce debt", async () => {
    await stable.mint(user.address, ethers.parseEther("100"));
    await token.connect(user).approve(pool.target, ethers.parseEther("150"));
    await pool.connect(user).borrow(ethers.parseEther("100"));

    await stable.connect(user).approve(pool.target, ethers.parseEther("100"));
    await pool.connect(user).repay(ethers.parseEther("100"));

    const [, debt] = await pool.getUserInfo(user.address);
    expect(debt).to.equal(0);
  });
});
