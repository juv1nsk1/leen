import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { leenFactoryrAddress, leenFactoryABI, leenPoolABI, erc20MetadataABI } from '@/lib/contracts';

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

export default function PoolList() {
  const [pools, setPools] = useState<any[]>([]);

  useEffect(() => {
    const loadPools = async () => {
      try {

        // get all pool addresses
        const poolAddresses = await client.readContract({
          address: leenFactoryrAddress as `0x${string}`,
          abi: leenFactoryABI,
          functionName: 'getPools'
        }) as string[];

        const poolData = await Promise.all(
          poolAddresses.map(async (address) => {
            const [borrowed, liquidity, config] = await Promise.all([
              client.readContract({ address: address as `0x${string}`, abi: leenPoolABI, functionName: 'totalBorrowed' }),
              client.readContract({ address: address as `0x${string}`, abi: leenPoolABI, functionName: 'totalLiquidity' }),
              client.readContract({ address: address as `0x${string}`, abi: leenPoolABI, functionName: 'config' })
            ]);

            const utilization = Number(borrowed) / Number(liquidity || 1);

            try {
              const name = await client.readContract({
                address: (config as any[])[0],
                abi: erc20MetadataABI,
                functionName: 'name'
              });

              return {
                address,
                tokenName: name || 'Unknown Token',
                token: (config as any[])[0],
                stablecoin: (config as any[])[1],
                interestRate: (config as any[])[2],
                collateralRatio: (config as any[])[3],
                liquidationRatio: (config as any[])[4],
                totalBorrowed: Number(borrowed),
                totalLiquidity: Number(liquidity),
                utilization
              };
            } catch (err) {
              console.error('Failed to fetch token name:', err);
              return {
                address,
                tokenName: 'Unknown Token',
                token: (config as any[])[0],
                stablecoin: (config as any[])[1],
                interestRate: (config as any[])[2],
                collateralRatio: (config as any[])[3],
                liquidationRatio: (config as any[])[4],
                totalBorrowed: Number(borrowed),
                totalLiquidity: Number(liquidity),
                utilization
              };
            }
          })
        );



        setPools(poolData);
      } catch (err) {
        console.error('Failed to load pools:', err);
      }
    };

    loadPools();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="space-y-4">
        {pools.map((pool, i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{pool.tokenName}</h2>
                <p className="text-sm text-gray-400">{pool.token}</p>
                <p className="text-sm text-gray-400">Pool #{i + 1}</p>
              </div>
              <Link href={`/borrow?pool=${pool.address}&token=${pool.token}`}>
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-medium">
                  {pool.utilization===1? 'View':'Borrow'}
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-300">
              <div>
                <span className="block text-white font-medium">Utilization</span>
                {(pool.utilization * 100).toFixed(2)}%
              </div>
              <div>
                <span className="block text-white font-medium">Net Borrow APR</span>
                {(Number(pool.interestRate) / 100).toFixed(2)}%
              </div>
              <div>
                <span className="block text-white font-medium">Total Borrowed</span>
                {pool.totalBorrowed}
              </div>
              <div>
                <span className="block text-white font-medium">Total Liquidity</span>
                {pool.totalLiquidity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
