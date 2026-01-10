import { AuctionProductDetail } from "../models/respose/auctionProductDetail";
import api from "./api";

const baseRoute: string = "auctions";

export class AuctionApi {
  async getDetail(id: string): Promise<AuctionProductDetail> {
    return await api.get(`${baseRoute}/details/${id}`).then((resp) => {
        console.log("Auction product detail response:", resp.data);
      return resp.data;
    })
    .catch((error) => {
      console.error("Error fetching auction product detail:", error);
      throw error;
    });
  }
}
