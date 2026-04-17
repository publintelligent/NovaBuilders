import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Bid} from '../utils/types';

interface BidsContextType {
  bids: Bid[];
  addBid: (bid: Bid) => Promise<void>;
  updateBid: (id: string, updates: Partial<Bid>) => Promise<void>;
  deleteBid: (id: string) => Promise<void>;
  getBid: (id: string) => Bid | undefined;
}

const BidsContext = createContext<BidsContextType | undefined>(undefined);
const STORAGE_KEY = '@nova_bids';

export function BidsProvider({children}: {children: ReactNode}) {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    loadBids();
  }, []);

  async function loadBids() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setBids(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load bids:', e);
    }
  }

  async function saveBids(updated: Bid[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setBids(updated);
  }

  async function addBid(bid: Bid) {
    await saveBids([bid, ...bids]);
  }

  async function updateBid(id: string, updates: Partial<Bid>) {
    const updated = bids.map(b => (b.id === id ? {...b, ...updates} : b));
    await saveBids(updated);
  }

  async function deleteBid(id: string) {
    await saveBids(bids.filter(b => b.id !== id));
  }

  function getBid(id: string) {
    return bids.find(b => b.id === id);
  }

  return (
    <BidsContext.Provider value={{bids, addBid, updateBid, deleteBid, getBid}}>
      {children}
    </BidsContext.Provider>
  );
}

export function useBids() {
  const ctx = useContext(BidsContext);
  if (!ctx) throw new Error('useBids must be used inside BidsProvider');
  return ctx;
}
