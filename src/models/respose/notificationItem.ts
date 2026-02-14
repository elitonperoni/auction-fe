interface NotificationItem {
    id: string;
    message: string;
    createdAt: Date;
    auctionId?: string;
    isRead: boolean
}