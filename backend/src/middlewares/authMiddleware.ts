import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';


dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};
