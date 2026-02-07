import { SearchAuctionListRequest } from "../models/request/searchAuctionListRequest";
import {
  AuctionListByUserResponse,
  AuctionListResponse,
  AuctionProductDetail,
  AuctionRegisterDetail,
} from "../models/respose/auctionProductDetail";
import { PaginationResponse } from "../models/respose/paginationResponse";
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

   async getRegisterDetail(id: string): Promise<AuctionRegisterDetail> {
    return await api
      .get(`${baseRoute}/register-detail/${id}`)
      .then((resp) => {
        return resp.data;
      })
      .catch((error) => {        
        throw error;
      });
  }

  async getList(request: SearchAuctionListRequest): Promise<PaginationResponse<AuctionListResponse>> {
    return await api
      .get(`${baseRoute}/list`, { params: request })
      .then((resp) => {
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
        return resp.data;
      })
      .catch((error) => {
        throw error;
      });
  }

   async getAuctionsByUser(): Promise<AuctionListByUserResponse[]> {
    return await api
      .get(`${baseRoute}/by-userid`)
      .then((resp) => {
        return resp.data;
      })
      .catch((error) => {
        throw error;
      });
  }
}
