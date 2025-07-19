import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

// JWT Secret (in production this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "ecko-admin-secret-key-2024";

// Hardcoded admin credentials (in production this should be in database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin", // In production, this should be hashed
  role: "admin",
};

// Schema for login validation
const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/login - Admin login
router.post("/login", async (req, res) => {
  try {
    const validation = LoginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: validation.error.errors,
      });
    }

    const { username, password } = validation.data;

    // Check credentials
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Generate JWT token
      const token = jwt.sign(
        {
          username: ADMIN_CREDENTIALS.username,
          role: ADMIN_CREDENTIALS.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          username: ADMIN_CREDENTIALS.username,
          role: ADMIN_CREDENTIALS.role,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/validate - Validate token
router.get("/validate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      res.json({
        success: true,
        user: {
          username: decoded.username,
          role: decoded.role,
        },
      });
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post("/logout", async (req, res) => {
  // Since we're using stateless JWT, logout is handled on client-side
  // In a more complex setup, you might want to maintain a blacklist of tokens
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Middleware to protect routes
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export default router;
