import { pgTable, text, serial, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define users table (keeping from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Food Category Enum
export const foodCategoryEnum = z.enum([
  "refrigerated", 
  "frozen", 
  "fruits_vegetables", 
  "meat", 
  "dairy", 
  "other"
]);

export type FoodCategory = z.infer<typeof foodCategoryEnum>;

// Unit Enum
export const unitEnum = z.enum([
  "piece",
  "gram",
  "kilogram",
  "milliliter",
  "liter",
  "serving"
]);

export type Unit = z.infer<typeof unitEnum>;

// Food items table
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
  expirationDate: date("expiration_date").notNull(),
  autoConsume: boolean("auto_consume").default(false),
  dailyConsumptionAmount: integer("daily_consumption_amount").default(0),
  dailyConsumptionUnit: text("daily_consumption_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  foodItemId: integer("food_item_id"),
  type: text("type").notNull(), // "expiration", "auto_consumed", "depleted"
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping cart items table
export const shoppingCartItems = pgTable("shopping_cart_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Zod schemas for validation
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertShoppingCartItemSchema = createInsertSchema(shoppingCartItems).omit({
  id: true,
  addedAt: true,
});

// Zod schemas with additional validation
export const foodItemWithValidationSchema = insertFoodItemSchema.extend({
  quantity: z.coerce.number().min(0, "수량은 0보다 작을 수 없습니다"),
  expirationDate: z.coerce.date().refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "유통기한은 오늘 이후여야 합니다"
  }),
  dailyConsumptionAmount: z.coerce.number().min(0, "소비량은 0보다 작을 수 없습니다"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertShoppingCartItem = z.infer<typeof insertShoppingCartItemSchema>;
export type ShoppingCartItem = typeof shoppingCartItems.$inferSelect;

// Added validation for insert user schema (kept from original schema)
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
