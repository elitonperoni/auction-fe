export const RoutesScreenPaths = {
  HOME: "/",
  AUCTION_REGISTER: (id?: string) => `/register-auction/${id}`,
  AUCTIONS_BY_USER: "/auctions-by-user" ,
  AUCTION_USER_BIDS: "/bids-by-user" ,
  AUCTION_DETAIL: (id: string) => `/product/${id}`,
}