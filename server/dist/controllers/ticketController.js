import { Ticket } from '../models/Ticket.js';
export const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: { tickets }, message: 'Tickets fetched successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const createTicket = async (req, res) => {
    try {
        const { name, phone, email, category, priority, message } = req.body || {};
        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: 'Customer name is required' });
        }
        const count = await Ticket.countDocuments();
        const ticketId = `TKT-2026-${String(count + 1001).padStart(4, '0')}`;
        const ticket = new Ticket({
            ticketId,
            name: String(name).trim(),
            phone: phone || '',
            email: email || '',
            category: category || 'Order Dispatch & Tracking',
            priority: priority || 'HIGH',
            message: message || '',
            status: 'OPEN',
            resolutionNote: ''
        });
        await ticket.save();
        return res.status(201).json({ success: true, data: { ticket }, message: 'Ticket created successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateTicket = async (req, res) => {
    try {
        const idStr = String(req.params.id || '').trim();
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
        const ticket = await Ticket.findOne({
            $or: [{ ticketId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!ticket)
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        const { status, resolutionNote, priority } = req.body || {};
        if (status)
            ticket.status = status;
        if (resolutionNote !== undefined)
            ticket.resolutionNote = resolutionNote;
        if (priority)
            ticket.priority = priority;
        await ticket.save();
        return res.json({ success: true, data: { ticket }, message: 'Ticket updated successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteTicket = async (req, res) => {
    try {
        const idStr = String(req.params.id || '').trim();
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
        const ticket = await Ticket.findOneAndDelete({
            $or: [{ ticketId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!ticket)
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        return res.json({ success: true, message: `Ticket ${ticket.ticketId} deleted permanently` });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
