import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFoodItemSchema, 
  foodItemWithValidationSchema,
  insertNotificationSchema, 
  insertShoppingCartItemSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // FOOD ITEMS ROUTES
  
  // Get all food items
  app.get("/api/food-items", async (req: Request, res: Response) => {
    try {
      const foodItems = await storage.getFoodItems();
      res.json(foodItems);
    } catch (err) {
      console.error("Error fetching food items:", err);
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get a specific food item by ID
  app.get("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const foodItem = await storage.getFoodItemById(id);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json(foodItem);
    } catch (err) {
      console.error("Error fetching food item:", err);
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  // Create a new food item
  app.post("/api/food-items", async (req: Request, res: Response) => {
    try {
      const validatedData = foodItemWithValidationSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(validatedData);
      res.status(201).json(foodItem);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  // Update a food item
  app.patch("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Validate just the fields that are provided
      const partialSchema = foodItemWithValidationSchema.partial();
      const validatedData = partialSchema.parse(req.body);

      const updatedFoodItem = await storage.updateFoodItem(id, validatedData);
      if (!updatedFoodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json(updatedFoodItem);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  // Delete a food item
  app.delete("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const deleted = await storage.deleteFoodItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.status(204).send();
    } catch (err) {
      console.error("Error deleting food item:", err);
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Consume a food item (reduce quantity)
  app.post("/api/food-items/:id/consume", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const { amount } = req.body;
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      const updatedFoodItem = await storage.consumeFoodItem(id, amount);
      if (!updatedFoodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json(updatedFoodItem);
    } catch (err) {
      console.error("Error consuming food item:", err);
      res.status(500).json({ message: "Failed to consume food item" });
    }
  });

  // Trigger automatic consumption (typically called by a scheduled job)
  app.post("/api/process-auto-consumption", async (req: Request, res: Response) => {
    try {
      await storage.processAutomaticConsumption();
      res.status(200).json({ message: "Auto consumption processed successfully" });
    } catch (err) {
      console.error("Error processing auto consumption:", err);
      res.status(500).json({ message: "Failed to process auto consumption" });
    }
  });

  // NOTIFICATION ROUTES
  
  // Get all notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark a notification as read
  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const marked = await storage.markNotificationAsRead(id);
      if (!marked) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // SHOPPING CART ROUTES
  
  // Get all shopping cart items
  app.get("/api/shopping-cart", async (req: Request, res: Response) => {
    try {
      const items = await storage.getShoppingCartItems();
      res.json(items);
    } catch (err) {
      console.error("Error fetching shopping cart items:", err);
      res.status(500).json({ message: "Failed to fetch shopping cart items" });
    }
  });

  // Add item to shopping cart
  app.post("/api/shopping-cart", async (req: Request, res: Response) => {
    try {
      const validatedData = insertShoppingCartItemSchema.parse(req.body);
      const item = await storage.addToShoppingCart(validatedData);
      res.status(201).json(item);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  // Remove item from shopping cart
  app.delete("/api/shopping-cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const removed = await storage.removeFromShoppingCart(id);
      if (!removed) {
        return res.status(404).json({ message: "Shopping cart item not found" });
      }

      res.status(204).send();
    } catch (err) {
      console.error("Error removing item from shopping cart:", err);
      res.status(500).json({ message: "Failed to remove item from shopping cart" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
