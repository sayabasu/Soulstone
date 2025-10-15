import { authenticateUser, registerUser } from './auth.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser({ name, email, password });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
};
