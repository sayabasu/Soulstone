import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../integrations/prismaClient.js';
import { loadConfig } from '../../config/environment.js';

const config = loadConfig();

/**
 * Hashes the provided password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => bcrypt.hash(password, 12);

/**
 * Compares a plaintext password to a hashed password.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

/**
 * Issues a signed JWT token for the user.
 * @param {{ id: string; email: string; role: string }} user
 * @returns {string}
 */
export const issueToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.tokenExpiresIn },
  );

/**
 * Creates a new user record.
 * @param {{ name: string; email: string; password: string }} input
 */
export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const created = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'customer',
    },
  });
  return created;
};

/**
 * Validates credentials and returns token + profile.
 * @param {{ email: string; password: string }} input
 */
export const authenticateUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = issueToken(user);
  const { passwordHash, ...safeUser } = user;
  return { token, user: safeUser };
};

export default {
  registerUser,
  authenticateUser,
};
