'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaInfoCircle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { leenPoolABI, erc20MetadataABI } from '@/lib/contracts';


export default function BorrowClient() {

  const [poolData, setPoolData] = useState<any>({});

  const [borrowAmount, setBorrowAmount] = useState(40491);
  const [maxBorrow, setMaxBorrow] = useState(100000);
  const searchParams = useSearchParams();
  const poolAddress = searchParams.get('pool');
  const tokenAddress = searchParams.get('token');

  const handleBorrow = async () => {
    if (!poolAddress) {
      alert('Missing pool address');
      return;
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum!)
    });

    const [account] = await walletClient.getAddresses();

    await walletClient.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20MetadataABI,
      functionName: 'approve',
      args: [poolAddress, BigInt(borrowAmount)],
      account
    });

    //await new Promise(resolve => setTimeout(resolve, 4000));

    try {
      const tx = await walletClient.writeContract({
        address: poolAddress as `0x${string}`,
        abi: leenPoolABI,
        functionName: 'borrow',
        account,
        args: [BigInt(borrowAmount)]
      });



      console.log('TX sent:', tx);
      alert('Borrow transaction sent!');
    } catch (err) {
      console.error(err);
      alert('Borrow transaction failed');
    }
  };

  const client = createPublicClient({
    chain: sepolia,
    transport: http()
  });

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const totalBorrowed = await client.readContract({ address: poolAddress as `0x${string}`, abi: leenPoolABI, functionName: 'totalBorrowed' })
        const totalLiquidity = await client.readContract({ address: poolAddress as `0x${string}`, abi: leenPoolABI, functionName: 'totalLiquidity' })
        const config = await client.readContract({ address: poolAddress as `0x${string}`, abi: leenPoolABI, functionName: 'config' })
        const name = await client.readContract({ address: tokenAddress as `0x${string}`, abi: erc20MetadataABI, functionName: 'name' });

        console.log('Config:', config);
        // set the pool data
        console.log('name:', name);
        setPoolData({
          address: poolAddress,
          tokenName: name || 'Unknown Token',
          stablecoin: (config as any)[1],
          interestRate: (config as any)[2],
          collateralRatio: (config as any)[3],
          liquidationRatio: (config as any)[4],
          totalBorrowed: Number(totalBorrowed),
          totalLiquidity: Number(totalLiquidity),
          utilization: Number(totalBorrowed) / Number(totalLiquidity || 1),
        });

        setMaxBorrow(Number(totalLiquidity) - Number(totalBorrowed));
        setBorrowAmount((Number(totalLiquidity) - Number(totalBorrowed))/2);
      } catch (err) {
        console.error('Failed to fetch pool data:', err);
      }
    };
    fetchPoolData();

  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center px-6">
    <div className="w-full max-w-3xl">
      <div className="mb-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-2xl font-bold mb-4">LEEN</h1>
          <p className="text-sm md:text-sm max-w-2sm mx-auto">
            Lend Any Token. Provide and access liquidity for your token.
          </p>
        </header>

          <div className="flex w-full bg-gradient-to-r from-gray-600 to-gray-400 p-1 rounded-full">

            <button
              className="flex-1 px-4 py-2 rounded-full font-medium text-gray-300">
              <Link href="/pool">Supply</Link>
            </button>

            <button
              className="flex-1 px-4 py-2 rounded-full font-medium bg-blue-200 text-black">
              Borrow
            </button>
          </div>
        </div>



        <h1 className="text-2xl font-bold mb-4">{poolData?.tokenName} Pool</h1>
        <p className="text-sm text-gray-400 mb-6">Borrow: <span className="text-white">USDT</span> | Contract: <span className="text-xs">{tokenAddress}</span></p>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#333"
                strokeWidth="3.8"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3.8"
                strokeDasharray="79.95, 100"
              />
              <text
                x="18"
                y="19"
                fill="white"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >{(poolData.utilization*100).toFixed(2)}%</text>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm">Total borrowed</p>
            <p className="text-lg font-semibold">${poolData.totalBorrowed}M of ${poolData.totalLiquidity}M</p>
            <p className="text-sm text-gray-400">APY, borrow rate: <span className="text-white">{poolData.interestRate}%</span></p>
          </div>
        </div>

        <div className="mb-6 bg-gray-800 rounded-md px-4 py-3 text-sm text-purple-300 flex items-center">
          <FaInfoCircle className="mr-2" />
          A 1% loan origination fee applies. Liquidations incur a 5% penalty.
        </div>

        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Borrow amount</label>
          <div className="relative w-full">
            <input
              type="range"
              min={1}
              max={maxBorrow}
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>1</span>
              <span>{maxBorrow.toLocaleString()}</span>
            </div>
            <div className="mt-2 w-full flex items-center justify-between bg-gray-800 px-4 py-2 rounded-md border border-gray-600">
              <span className="text-lg font-semibold">{borrowAmount.toLocaleString()}</span>
              <img src="/leen/icon-usdt.png" alt="USDT icon" className="h-5 w-5" />
            </div>
          </div>
        </div>

        <button onClick={handleBorrow} className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md font-medium">
          Confirm Borrow / Repay
        </button>

      </div>

      <footer className="bottom-6 text-sm text-gray-400 pt-4">
        Duke FinTech | Blockchain 564 | © {new Date().getFullYear()} LEEN Protocol
      </footer>
    </main>
  );
}
