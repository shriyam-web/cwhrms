import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log("[DB] Using cached connection")
    return { client: cachedClient, db: cachedDb }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  try {
    console.log("[DB] Connecting to MongoDB")
    const client = new MongoClient(process.env.DATABASE_URL)
    await client.connect()
    
    const db = client.db("citywitty-hrms")
    
    cachedClient = client
    cachedDb = db
    
    console.log("[DB] Connected to MongoDB successfully")
    return { client, db }
  } catch (error) {
    console.error("[DB] Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export const db = {
  async users() {
    const database = await getDatabase()
    return database.collection("users")
  },
  async employeeProfiles() {
    const database = await getDatabase()
    return database.collection("employeeProfiles")
  },
  async agentProfiles() {
    const database = await getDatabase()
    return database.collection("agentProfiles")
  },
  async attendanceLogs() {
    const database = await getDatabase()
    return database.collection("attendanceLogs")
  },
  async officeSettings() {
    const database = await getDatabase()
    return database.collection("officeSettings")
  },
  async payouts() {
    const database = await getDatabase()
    return database.collection("payouts")
  },
  async targets() {
    const database = await getDatabase()
    return database.collection("targets")
  },
  async notifications() {
    const database = await getDatabase()
    return database.collection("notifications")
  },
  async qrTokens() {
    const database = await getDatabase()
    return database.collection("qrTokens")
  },
  async holidays() {
    const database = await getDatabase()
    return database.collection("holidays")
  },
}


