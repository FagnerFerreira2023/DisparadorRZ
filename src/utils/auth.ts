import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config.js';

const SALT_ROUNDS = 12;

// =========================================================
// Password Hashing
// =========================================================

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// =========================================================
// JWT Tokens
// =========================================================

export interface TokenPayload {
    userId: string;
    tenantId: string | null;
    role: 'superadmin' | 'admin_tenant' | 'user_tenant';
    email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessTokenExpiry,
    });
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshTokenExpiry,
    });
}

export function verifyAccessToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (err) {
        throw new Error('invalid_token');
    }
}

export function verifyRefreshToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    } catch (err) {
        throw new Error('invalid_refresh_token');
    }
}

// =========================================================
// Token Hashing (for storing in DB)
// =========================================================

export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// =========================================================
// Password Reset Token
// =========================================================

export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Normalizes WhatsApp number to digits only and ensures it starts with 55 DDI.
 */
export function normalizeWhatsApp(whatsapp: string): string {
    let clean = whatsapp.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (!clean.startsWith('55')) {
        clean = '55' + clean;
    }
    return clean;
}
