export const RoutesScreenPaths = {
  HOME: "/",
  REGISTER: (id?: string) => `/register-auction/${id}`,
  MYAUCTIONS: "/my-auctions" ,
  MYBIDS: "/my-bids" ,
  AUCTION_DETAIL: (id: string) => `/product/${id}`,
}