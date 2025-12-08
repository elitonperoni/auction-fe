import { KeyValuePair } from "./keyValue";

export interface AuctionProductDetail {
  id: string;
  title: string;
  images: string[];
  currentBid: number;
  minBid: number;
  bidsCounts: number;
  category: string;
  description: string;
  seller: string;
  //sellerRating: number;
  condition: string;
  location: string;
  startDate: Date;
  endDate: Date;
  bidHistory: KeyValuePair<string, number>[];
}