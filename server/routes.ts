import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSignupSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Signup endpoint
  app.post("/api/signup", async (req, res) => {
    try {
      const signupData = insertSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingSignup = await storage.getSignupByEmail(signupData.email);
      if (existingSignup) {
        return res.status(400).json({ 
          message: "Email already registered. Thank you for your interest in PeraBida!" 
        });
      }

      const signup = await storage.createSignup(signupData);
      res.status(201).json({ 
        message: "Successfully joined the waitlist! We'll notify you when PeraBida launches.",
        id: signup.id 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ 
          message: "Please check your information and try again.",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Get signup statistics (for admin or stats display)
  app.get("/api/signups/stats", async (_req, res) => {
    try {
      const signups = await storage.getAllSignups();
      const stats = {
        total: signups.length,
        countries: [...new Set(signups.map(s => s.country))].length,
        recentSignups: signups.filter(s => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return s.createdAt >= dayAgo;
        }).length
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
