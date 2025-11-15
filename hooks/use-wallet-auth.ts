'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import bs58 from 'bs58';

export function useWalletAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Get wallet address
  const walletAddress = publicKey?.toString();

  // Sign a message with the wallet for verification
  const signWalletMessage = async (message: string) => {
    if (!signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await signMessage(encodedMessage);
    return bs58.encode(signature);
  };

  // Authenticate wallet with backend
  const authenticateWallet = async () => {
    if (!walletAddress || !signMessage) return;

    setIsAuthenticating(true);
    try {
      // Create a message to sign with timestamp
      const message = `Sign this message to authenticate with your Solana wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      // Sign the message
      const signature = await signWalletMessage(message);

      // Send to backend for verification
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          message,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Wallet authentication error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Disconnect both wallet and Clerk session if needed
  const disconnectAll = async () => {
    await disconnect();
    if (isSignedIn) {
      await signOut();
    }
  };

  return {
    walletAddress,
    connected,
    isAuthenticating,
    authenticateWallet,
    signWalletMessage,
    disconnectAll,
    user,
    isSignedIn,
  };
}
