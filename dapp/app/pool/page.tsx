'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import PoolList from '../borrow/poollist';
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { leenFactoryABI, leenFactoryrAddress, leenPoolABI, erc20MetadataABI, stablecoinAddress } from '@/lib/contracts'
import { createPublicClient, http } from 'viem'
import { toTokenUnits } from '@/lib/math';



export default function CreatePool() {
  const [mode, setMode] = useState<'supply' | 'borrow'>('supply');
  const [network, setNetwork] = useState('Sepolia');
  const [stablecoin, setStablecoin] = useState('USDT');
  const [tokenAddress, setTokenAddress] = useState('0xF63e2a0169F09882F97f58a34b4bDDF8768dCa06');
  const [depositAmount, setDepositAmount] = useState(1000);
  const [collateralRatio, setCollateralRatio] = useState(150);
  const [liquidationThreshold, setLiquidationThreshold] = useState(120);
  const [interestRate, setInterestRate] = useState('5');
  const [autoReinvest, setAutoReinvest] = useState(true);
  const [tokenPrice, setTokenPrice] = useState(0.25);
  const [buttonLabel, setButtonLabel] = useState('Create Pool');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask");
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      alert("Wallet connected!");
    } catch (err) {
      console.error("User rejected connection", err);
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum)
    });

    const [account] = await walletClient.getAddresses();

    if (!account) {
      await connectWallet();
      return;
    }

    const amountInWei = depositAmount;




    const client = createPublicClient({
      chain: sepolia,
      transport: http()
    })

    let poolAddress = await client.readContract({
      address: leenFactoryrAddress,
      abi: leenFactoryABI,
      functionName: 'getPoolForToken',
      args: [tokenAddress]
    });


    if (poolAddress == "0x0000000000000000000000000000000000000000") {

      console.log("Creating pool");
      await walletClient.writeContract({
        address: leenFactoryrAddress,
        abi: leenFactoryABI,
        functionName: 'createNewPool',
        account,
        args: [
          tokenAddress,
          stablecoinAddress,
          BigInt(interestRate),
          BigInt(collateralRatio),
          BigInt(liquidationThreshold)
        ]
      });

      await new Promise(resolve => setTimeout(resolve, 8000));

      poolAddress = await client.readContract({
        address: leenFactoryrAddress,
        abi: leenFactoryABI,
        functionName: 'getPoolForToken',
        args: [tokenAddress]
      });
      console.log("Pool created at address", poolAddress);
      setButtonLabel("Fund Pool");

    } else {
      setButtonLabel("Funding Pool");
      console.log("Doing a deposit");
    }

    console.log("tolen address", tokenAddress);
    console.log("amount in wei", amountInWei);
    console.log("stablecoin address", stablecoinAddress);
    console.log("account", account);
    console.log("factory address", leenFactoryrAddress);
    console.log("pool address", poolAddress);

    await walletClient.writeContract({
      address: stablecoinAddress as `0x${string}`,
      abi: erc20MetadataABI,
      functionName: 'approve',
      account,
      args: [poolAddress, amountInWei]
    });

    await new Promise(resolve => setTimeout(resolve, 4000));

    // const allowance = await client.readContract({
    //   address: stablecoinAddress,
    //   abi: erc20MetadataABI,
    //   functionName: 'allowance',
    //   args: [account, poolAddress]
    // });

    // console.log("allowance", allowance);
    // await new Promise(resolve => setTimeout(resolve, 4000));

    const tx = await walletClient.writeContract({
      address: poolAddress as `0x${string}`,
      abi: leenPoolABI,
      functionName: 'deposit',
      account,
      args: [amountInWei]
    });

    console.log('TX sent:', tx);
    alert('Pool created and funded successfully!');

    setButtonLabel("Transaction sent");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center  px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-2xl font-bold mb-4 pt-4">LEEN</h1>
            <p className="text-sm md:text-sm max-w-2sm mx-auto">
              Lend Any Token. Provide and access liquidity for your token.
            </p>
          </header>
          <div className="flex w-full bg-gradient-to-r from-gray-600 to-gray-400 p-1 rounded-full">
            <button
              className={`flex-1 px-4 py-2 rounded-full font-medium ${mode === 'supply' ? 'bg-blue-200 text-black' : 'text-gray-300'}`}
              onClick={() => setMode('supply')}
            >
              Supply
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-full font-medium ${mode === 'borrow' ? 'bg-blue-200 text-black' : 'text-gray-300'}`}
              onClick={() => setMode('borrow')}
            >
              Borrow
            </button>
          </div>
        </div>

        {mode === 'supply' ? (

          <form className="bg-gray-900 p-6 rounded-xl grid grid-cols-1 gap-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                >
                  <option>Sepolia</option>
                  <option disabled>Mainnet</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Stablecoin</label>
                <select
                  value={stablecoin}
                  onChange={(e) => setStablecoin(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                >
                  <option>USDT</option>
                  <option disabled>USDC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1">Token Contract Address</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Deposit Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                />
              </div>
              <div>
                    <label className="block mb-1">Pool Interest Rate (%)</label>
                    <select
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                    >
                      <option value="3">3%</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="autoReinvest"
                      checked={autoReinvest}
                      onChange={(e) => setAutoReinvest(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="autoReinvest">Auto Reinvest Yield</label>
                  </div>
             
            </div>
            <div className="text-right">
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-purple-400 hover:underline">
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block mb-1">Collateral Ratio (%)</label>
                <input
                  type="number"
                  value={collateralRatio}
                  onChange={(e) => setCollateralRatio(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1">Liquidation Threshold (%)</label>
                <input
                  type="number"
                  value={liquidationThreshold}
                  onChange={(e) => setLiquidationThreshold(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md"
                />
              </div>
                 
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Token Price (USD)</label>
                    <input type="number" value={tokenPrice} onChange={(e) => setTokenPrice(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-md" />
                  </div>
                  <div>
                    <label className="block mb-1">Oracle Provider <span className="text-xs text-orange-300">(not available)</span></label>
                    <div className="flex space-x-4 mt-2">
                      <label className="inline-flex items-center">
                        <input type="radio" name="oracle" disabled className="form-radio text-purple-600" />
                        <span className="ml-2 text-gray-400">Fact Finance</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="oracle" disabled className="form-radio text-purple-600" />
                        <span className="ml-2 text-gray-400">Chainlink</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="text-sm text-gray-400">
              LEEN Protocol charges a 1% fee on all loan disbursements and a 5% penalty on liquidations.
            </div>

            <div>
              <button onClick={handleCreatePool} className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md font-medium">
                {buttonLabel}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-400 mt-10">
            <PoolList />

          </div>
        )}
      </div>

      <footer className="bottom-6 text-sm text-gray-400 pt-4">
        Duke FinTech | Blockchain 564 | © {new Date().getFullYear()} LEEN Protocol
      </footer>
    </main>
  );
}

