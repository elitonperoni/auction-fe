import {
  AuctionListResponse,
  AuctionProductDetail,
  CreateAuctionRequest,
} from "../models/respose/auctionProductDetail";
import api from "./api";

const baseRoute: string = "auctions";

export class AuctionApi {
  async getDetail(id: string): Promise<AuctionProductDetail> {
    return await api
      .get(`${baseRoute}/details/${id}`)
      .then((resp) => {
        return resp.data;
      })
      .catch((error) => {
        console.error("Error fetching auction product detail:", error);
        throw error;
      });
  }

  async getList(): Promise<AuctionListResponse[]> {
    return await api
      .get(`${baseRoute}/list`)
      .then((resp) => {
        debugger;
        return resp.data;
      })
      .catch((error) => {
        throw error;
      });
  }

  async create(request: FormData): Promise<string> {

    return await api
      .post(`${baseRoute}/new`, request, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((resp) => {
        debugger;
        return resp.data;
      })
      .catch((error) => {
        throw error;
      });
  }
}
