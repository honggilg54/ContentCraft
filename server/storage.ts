import { 
  users, 
  foodItems, 
  notifications, 
  shoppingCartItems, 
  type User, 
  type InsertUser, 
  type FoodItem, 
  type InsertFoodItem,
  type Notification,
  type InsertNotification,
  type ShoppingCartItem,
  type InsertShoppingCartItem
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations (keeping from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Food item operations
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItemById(id: number): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, foodItem: Partial<FoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;
  consumeFoodItem(id: number, amount: number): Promise<FoodItem | undefined>;
  
  // Auto-consumption functionality
  processAutomaticConsumption(): Promise<void>;
  
  // Notification operations
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Shopping cart operations
  getShoppingCartItems(): Promise<ShoppingCartItem[]>;
  addToShoppingCart(item: InsertShoppingCartItem): Promise<ShoppingCartItem>;
  removeFromShoppingCart(id: number): Promise<boolean>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodItems: Map<number, FoodItem>;
  private notifications: Map<number, Notification>;
  private shoppingCartItems: Map<number, ShoppingCartItem>;
  
  private userId: number;
  private foodItemId: number;
  private notificationId: number;
  private shoppingCartItemId: number;

  constructor() {
    this.users = new Map();
    this.foodItems = new Map();
    this.notifications = new Map();
    this.shoppingCartItems = new Map();
    
    this.userId = 1;
    this.foodItemId = 1;
    this.notificationId = 1;
    this.shoppingCartItemId = 1;
    
    // Add some initial data for demonstration
    const today = new Date();
    
    // No initial data - we'll let users create everything themselves
  }

  // User operations (keeping from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Food item operations
  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItemById(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.foodItemId++;
    const now = new Date();
    const newFoodItem: FoodItem = { 
      ...foodItem, 
      id, 
      createdAt: now
    };
    
    this.foodItems.set(id, newFoodItem);
    
    // Check if expiration date is within 3 days and create notification
    const expirationDate = new Date(foodItem.expirationDate);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration <= 3) {
      await this.createNotification({
        foodItemId: id,
        type: "expiration",
        message: `${foodItem.name}의 유통기한이 ${daysUntilExpiration}일 남았습니다.`,
        isRead: false
      });
    }
    
    return newFoodItem;
  }

  async updateFoodItem(id: number, foodItem: Partial<FoodItem>): Promise<FoodItem | undefined> {
    const existingFoodItem = this.foodItems.get(id);
    
    if (!existingFoodItem) {
      return undefined;
    }
    
    const updatedFoodItem: FoodItem = { ...existingFoodItem, ...foodItem };
    this.foodItems.set(id, updatedFoodItem);
    
    return updatedFoodItem;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  async consumeFoodItem(id: number, amount: number): Promise<FoodItem | undefined> {
    const foodItem = this.foodItems.get(id);
    
    if (!foodItem) {
      return undefined;
    }
    
    const newQuantity = Math.max(0, foodItem.quantity - amount);
    const updatedFoodItem: FoodItem = { 
      ...foodItem, 
      quantity: newQuantity 
    };
    
    this.foodItems.set(id, updatedFoodItem);
    
    // If the item is depleted, create notification and add to shopping cart
    if (newQuantity === 0) {
      await this.createNotification({
        foodItemId: id,
        type: "depleted",
        message: `${foodItem.name}이 소진되어 장바구니에 추가되었습니다.`,
        isRead: false
      });
      
      await this.addToShoppingCart({
        name: foodItem.name,
        quantity: 1,
        unit: foodItem.unit
      });
    }
    
    return updatedFoodItem;
  }

  // Auto-consumption functionality - runs daily to automatically consume items
  async processAutomaticConsumption(): Promise<void> {
    // Get all items with auto consumption enabled
    const autoConsumeItems = Array.from(this.foodItems.values())
      .filter(item => item.autoConsume && item.dailyConsumptionAmount > 0);
    
    // Group by name for FIFO processing
    const itemsByName = new Map<string, FoodItem[]>();
    
    autoConsumeItems.forEach(item => {
      const items = itemsByName.get(item.name) || [];
      items.push(item);
      itemsByName.set(item.name, items);
    });
    
    // Process each group
    for (const [name, items] of itemsByName.entries()) {
      // Sort by expiration date (FIFO - first expiring first out)
      const sortedItems = items.sort((a, b) => 
        new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      );
      
      for (const item of sortedItems) {
        if (item.quantity <= 0) continue;
        
        // Consume the daily amount
        const consumed = Math.min(item.quantity, item.dailyConsumptionAmount);
        const updatedItem = await this.consumeFoodItem(item.id, consumed);
        
        if (updatedItem) {
          await this.createNotification({
            foodItemId: item.id,
            type: "auto_consumed",
            message: `${item.name}에서 ${consumed}${item.dailyConsumptionUnit} 자동 소비되었습니다.`,
            isRead: false
          });
        }
        
        // If we didn't consume the full daily amount and there are more items, continue to the next
        if (consumed < item.dailyConsumptionAmount) {
          const remaining = item.dailyConsumptionAmount - consumed;
          // We'll continue with the next item
        } else {
          // We've consumed the full daily amount, so stop
          break;
        }
      }
    }
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    // Get all notifications sorted by createdAt (newest first)
    return Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const newNotification: Notification = { ...notification, id, createdAt: now };
    
    this.notifications.set(id, newNotification);
    
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    
    if (!notification) {
      return false;
    }
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    
    return true;
  }

  // Shopping cart operations
  async getShoppingCartItems(): Promise<ShoppingCartItem[]> {
    return Array.from(this.shoppingCartItems.values());
  }

  async addToShoppingCart(item: InsertShoppingCartItem): Promise<ShoppingCartItem> {
    const id = this.shoppingCartItemId++;
    const now = new Date();
    const newShoppingCartItem: ShoppingCartItem = { 
      ...item, 
      id, 
      addedAt: now 
    };
    
    this.shoppingCartItems.set(id, newShoppingCartItem);
    
    return newShoppingCartItem;
  }

  async removeFromShoppingCart(id: number): Promise<boolean> {
    return this.shoppingCartItems.delete(id);
  }
}

// Export a single instance of the storage
export const storage = new MemStorage();
