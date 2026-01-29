/* eslint-disable prettier/prettier */
import { Schema, model } from "mongoose";
import { ITicket, ITicketMessage } from "./ticket.interface";
const messageSchema = new Schema<ITicketMessage>({
    senderRole: { type: String, enum: ["user", "vendor", "admin", 'superAdmin'], required: true },
    senderId: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

const ticketSchema = new Schema<ITicket>(
    {
        ticketId: { type: String, unique: true },
        subject: String,
        description: String,
        type: { type: String, enum: ["order", "payment", "product", "account", "other"] },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        status: { type: String, enum: ["open", "pending", "resolved", "closed"], default: "open" },

        userId: String,
        vendorId: String,
        orderId: String,
        messages: [messageSchema],
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true }
)

export const Ticket = model("Ticket", ticketSchema);