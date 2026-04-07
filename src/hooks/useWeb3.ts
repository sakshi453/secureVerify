"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import CertificateRegistryABI from '@/lib/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const AMOY_CHAIN_ID = "0x13882"; // 80002 in hex

/**
 * Custom hook for interacting with Ethereum/Polygon via MetaMask.
 * Provides account state, provider/signer, and contract instances.
 */
export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connects to the user's MetaMask wallet.
   */
  const connectWallet = useCallback(async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) {
      setError("MetaMask is not installed. Please install it to continue.");
      return null;
    }

    try {
      setIsConnecting(true);
      setError(null);
      
      const browserProvider = new ethers.BrowserProvider(ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const rpcSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(rpcSigner);
      setChainId(network.chainId);

      // Attempt to switch to Amoy network if not already on it
      if (network.chainId !== BigInt(80002)) {
        await switchNetwork();
      }
      
      return { account: accounts[0], signer: rpcSigner, provider: browserProvider };
    } catch (err: any) {
      console.error("Failed to connect to MetaMask", err);
      setError(err.message || "Connection failed");
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Instance of the smart contract with a signer for write operations.
   */
  const contract = useMemo(() => {
    if (!signer || !CONTRACT_ADDRESS) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CertificateRegistryABI.abi, signer);
  }, [signer]);

  /**
   * Instance of the smart contract with a provider for read-only operations.
   */
  const readOnlyContract = useMemo(() => {
    if (!provider || !CONTRACT_ADDRESS) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CertificateRegistryABI.abi, provider);
  }, [provider]);

  /**
   * Automatically prompts the user to switch to or add the Polygon Amoy network.
   */
  const switchNetwork = useCallback(async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AMOY_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: AMOY_CHAIN_ID,
                chainName: 'Polygon Amoy Testnet',
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network", addError);
        }
      }
    }
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          new ethers.BrowserProvider(ethereum).getSigner().then(setSigner);
        } else {
          setAccount(null);
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    contract,
    readOnlyContract,
    connectWallet,
    switchNetwork,
    isConnecting,
    error
  };
}
