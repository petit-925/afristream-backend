"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClients = listClients;
exports.createClient = createClient;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
const mapClientUser = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: null,
    location: row.address ?? '',
    avatar: row.avatar_url ?? '',
    joinDate: row.created_at,
    totalProjects: 0,
    totalSpent: 0,
    status: 'active',
    rating: 0,
    lastContact: row.updated_at,
    projectTypes: [],
    twoFactorEnabled: !!row.two_factor_enabled,
});
async function listClients(_req, res) {
    try {
        const [rows] = await db_1.pool.query('SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, created_at, updated_at FROM client_users ORDER BY created_at DESC');
        const clients = rows.map(mapClientUser);
        res.json(clients);
    }
    catch (error) {
        console.error('Failed to list clients:', error);
        res.json([]);
    }
}
async function createClient(req, res) {
    const data = req.body;
    if (!data?.name || !data?.email) {
        throw AppError_1.AppError.badRequest('Client name and email are required');
    }
    const now = new Date();
    const [result] = await db_1.pool.query('INSERT INTO client_users (name, email, password, phone, address, avatar_url, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        data.name,
        data.email,
        '',
        data.phone || null,
        data.location || data.address || null,
        data.avatar || data.avatar_url || null,
        0,
        now,
        now,
    ]);
    const insertId = result.insertId;
    const [rows] = await db_1.pool.query('SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, created_at, updated_at FROM client_users WHERE id = ? LIMIT 1', [insertId]);
    if (!rows.length) {
        throw AppError_1.AppError.internal('Failed to load newly created client');
    }
    res.status(201).json(mapClientUser(rows[0]));
}
