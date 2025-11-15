import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Verify Solana wallet signature
function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const pubKey = new PublicKey(publicKey);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    // Verify signature using tweetnacl
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pubKey.toBytes()
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, message, signature } = await request.json();

    if (!walletAddress || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if user is already signed in with Clerk
    const { userId } = await auth();

    if (userId) {
      // Update existing user with wallet address
      try {
        await db
          .update(users)
          .set({ 
            walletAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, userId));

        return NextResponse.json({
          success: true,
          message: 'Wallet linked successfully',
          walletAddress,
        });
      } catch (error) {
        console.error('Error updating user with wallet:', error);
      }
    }

    // For users not signed in with Clerk, return success with wallet info
    // You can implement additional logic here to create a wallet-only session
    return NextResponse.json({
      success: true,
      message: 'Wallet authenticated successfully',
      walletAddress,
      requiresSignUp: !userId,
    });
  } catch (error) {
    console.error('Wallet authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if wallet is linked
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    const user = result[0];

    return NextResponse.json({
      walletAddress: user?.walletAddress || null,
      hasWallet: !!user?.walletAddress,
    });
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
