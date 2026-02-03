/* eslint-disable prettier/prettier */
export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type TicketType = "order" | "payment" | "product" | "account" | "other";
export type ITicketMessage = {
    senderRole: 'user' | 'admin' | 'vendor' | 'superAdmin'
    senderId: string
    message: string
    createdAt: Date
}

export type ITicket = {
    _id?: string;
    ticketId: string;
    subject: string;
    description: string;
    type: TicketType
    priority: TicketPriority;
    status: TicketStatus;
    messages: ITicketMessage[];
    userId?: string;
    orderId?: string;
    createdAt: Date;
    updatedAt: Date;
}