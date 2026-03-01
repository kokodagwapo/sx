import { type User, type InsertUser, type Signup, type InsertSignup } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSignup(signup: InsertSignup): Promise<Signup>;
  getSignupByEmail(email: string): Promise<Signup | undefined>;
  getAllSignups(): Promise<Signup[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private signups: Map<string, Signup>;

  constructor() {
    this.users = new Map();
    this.signups = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSignup(insertSignup: InsertSignup): Promise<Signup> {
    const id = randomUUID();
    const signup: Signup = {
      ...insertSignup,
      id,
      createdAt: new Date(),
    };
    this.signups.set(id, signup);
    return signup;
  }

  async getSignupByEmail(email: string): Promise<Signup | undefined> {
    return Array.from(this.signups.values()).find(
      (signup) => signup.email === email,
    );
  }

  async getAllSignups(): Promise<Signup[]> {
    return Array.from(this.signups.values());
  }
}

export const storage = new MemStorage();
