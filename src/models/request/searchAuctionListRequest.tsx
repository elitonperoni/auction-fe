import { PaginationRequest } from "./paginationRequest";

export interface SearchAuctionListRequest extends PaginationRequest {
    searchTerm?: string;
}
