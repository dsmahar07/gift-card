'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export function WalletButton() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Sync wallet connection with user state
    if (connected && publicKey) {
      console.log('Wallet connected:', publicKey.toString());
      // You can add logic here to link the wallet to the user's account
    }
  }, [connected, publicKey]);

  return (
    <div className="flex items-center gap-2">
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-lg !h-10 !px-4 !text-sm !font-medium !transition-all" />
    </div>
  );
}
