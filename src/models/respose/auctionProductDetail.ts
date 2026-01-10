import { KeyValuePair } from "./keyValue";

export interface AuctionProductDetail {
  id: string;
  title: string;
  photos: string[];
  currentBid: number;
  minBid: number;
  bidsCounts: number;
  category: string;
  description: string;
  seller: string;
  condition: string;
  location: string;
  startDate: Date;
  endDate: Date;
  bidHistory: BidHistory[];
}

export interface BidHistory{
  bidderName: string;  
  date: Date;
  amount: number;
}