export interface PaginationResponse<T>
{
    items: T[];
    metaData: PaginationMetadata;
}

export interface PaginationMetadata
{
    totalCount: number;
    pageSize: number;
    pageIndex: number;
    totalPages: number;
}