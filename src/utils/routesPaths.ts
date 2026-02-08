export const RoutesScreenPaths = {
  HOME: "/",
  AUCTION_REGISTER: (id?: string) => id ? `/register-auction/${id}` : '/register-auction',
  AUCTIONS_BY_USER: "/auctions-by-user" ,
  AUCTION_USER_BIDS: "/bids-by-user" ,
  AUCTION_DETAIL: (id: string) => `/product/${id}`,
}