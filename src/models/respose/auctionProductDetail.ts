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

export interface AuctionRegisterDetail {
  id: string;
  title: string;
  initialValue: number;
  photos: string[];
  endDate: Date;
  description: string;  
}

export interface BidHistory{
  bidderName: string;  
  date: Date;
  amount: number;
}

export interface AuctionListResponse
{
  id: string;
  title: string;
  currentPrice: number;
  startingPrice: number;
  bidCount: number;
  imageUrl: string;
  endDate: Date;
  seller: string;
}

export interface AuctionListByUserResponse
{
  id: string;
  title: string;
  currentPrice: number;
  bidCount: number;
  imageUrl: string;
  endDate: Date;
  actualWinner: string;
  status: string;
}

export interface AuctionBidsByUserResponse
{
  id: string;
  title: string;
  currentPrice: number;
  bidCount: number;
  userLastBidAmount: number;
  actualLeader: string;
  imageUrl: string;
  endDate: Date;
  userBidsCount: string;
  isUserActualLeader: boolean;
  isUserWinner: boolean;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  endDate: Date;
  images: File[];
}
