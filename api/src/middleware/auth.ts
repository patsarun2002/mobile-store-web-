import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

interface JwtPayload {
  id: string;
  level?: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  jwt.verify(token, process.env.SECRET_KEY as string, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

const authorize = (...roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Backward compatibility: if token doesn't have level, fetch from database
    if (!req.user.level) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { level: true },
        });
        if (user) {
          req.user.level = user.level;
        }
      } catch {
        res.status(500).json({ message: "Error checking permissions" });
        return;
      }
    }

    if (!req.user.level || !roles.includes(req.user.level)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
};

export { authenticateToken, authorize, AuthRequest };
