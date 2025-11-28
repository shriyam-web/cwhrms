import { db } from "./db"
import { ObjectId } from "mongodb"

const buildIdQuery = (id: string | ObjectId) => {
  if (!id) {
    throw new Error("ID is required")
  }

  const orConditions: Record<string, any>[] = []

  if (id instanceof ObjectId) {
    orConditions.push({ _id: id })
    orConditions.push({ id: id.toString() })
  } else {
    if (ObjectId.isValid(id)) {
      orConditions.push({ _id: new ObjectId(id) })
    }
    orConditions.push({ _id: id })
    orConditions.push({ id })
  }

  const uniqueConditions = orConditions.filter((condition, index) => {
    const key = JSON.stringify(condition)
    return index === orConditions.findIndex((item) => JSON.stringify(item) === key)
  })

  return uniqueConditions.length === 1 ? uniqueConditions[0] : { $or: uniqueConditions }
}

export const prisma = {
  agentProfile: {
    async findMany(options?: any) {
      const collection = await db.agentProfiles()
      let agents = await collection.find({}).toArray()

      if (options?.include?.user) {
        const usersCollection = await db.users()
        agents = await Promise.all(
          agents.map(async (agent) => {
            const user = await usersCollection.findOne({ _id: agent.userId })
            return {
              ...agent,
              user: user ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
              } : null,
            }
          })
        )
      }

      return agents.map((agent) => ({
        id: agent._id.toString(),
        ...agent,
      }))
    },

    async create(options: any) {
      const data = options.data
      const usersCollection = await db.users()
      const agentCollection = await db.agentProfiles()

      let userId: ObjectId | undefined

      if (data.user?.create) {
        const userResult = await usersCollection.insertOne({
          ...data.user.create,
          password: data.user.create.password || "temp-password",
          isActive: true,
          profilePicture: null,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        userId = userResult.insertedId
      }

      const agentData = {
        userId,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        joiningDate: data.joiningDate,
        commissionRate: data.commissionRate || null,
        status: "ACTIVE",
        documentUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await agentCollection.insertOne(agentData)

      const agent = { _id: result.insertedId, ...agentData }

      if (options.include?.user && userId) {
        const user = await usersCollection.findOne({ _id: userId })
        return {
          id: agent._id.toString(),
          ...agent,
          user: user ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          } : null,
        }
      }

      return {
        id: agent._id.toString(),
        ...agent,
      }
    },

    async findUnique(options: any) {
      const collection = await db.agentProfiles()
      let agent

      if (options.where.id) {
        agent = await collection.findOne({ _id: new ObjectId(options.where.id) })
      } else if (options.where.userId) {
        agent = await collection.findOne({
          userId: new ObjectId(options.where.userId),
        })
      }

      return agent
        ? {
            id: agent._id.toString(),
            ...agent,
          }
        : null
    },
  },

  employeeProfile: {
    async findMany(options?: any) {
      const collection = await db.employeeProfiles()
      let employees = await collection.find({}).toArray()

      if (options?.include?.user) {
        const usersCollection = await db.users()
        employees = await Promise.all(
          employees.map(async (emp) => {
            const user = await usersCollection.findOne({ _id: emp.userId })
            return {
              ...emp,
              user: user
                ? {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                  }
                : null,
            }
          })
        )
      }

      return employees.map((emp) => ({
        ...emp,
        id: emp._id.toString(),
      }))
    },

    async findUnique(options: any) {
      const collection = await db.employeeProfiles()
      let emp

      if (options.where.id) {
        emp = await collection.findOne(buildIdQuery(options.where.id))
      } else if (options.where.userId) {
        emp = await collection.findOne({
          userId: new ObjectId(options.where.userId),
        })
      }

      if (!emp) {
        return null
      }

      let user
      if (options.include?.user && emp.userId) {
        const usersCollection = await db.users()
        const userDoc = await usersCollection.findOne({ _id: emp.userId })
        user = userDoc
          ? {
              id: userDoc._id.toString(),
              name: userDoc.name,
              email: userDoc.email,
              phone: userDoc.phone,
              role: userDoc.role,
            }
          : null
      }

      return {
        ...emp,
        id: emp._id.toString(),
        ...(options.include?.user ? { user } : {}),
      }
    },

    async create(options: any) {
      const data = options.data
      const usersCollection = await db.users()
      const empCollection = await db.employeeProfiles()

      let userId: ObjectId | undefined

      if (data.user?.create) {
        const userResult = await usersCollection.insertOne({
          ...data.user.create,
          password: data.user.create.password || "temp-password",
          isActive: true,
          profilePicture: null,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        userId = userResult.insertedId
      }

      const empData = {
        userId,
        email: data.email,
        phone: data.phone || null,
        employeeCode: data.employeeCode || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        joiningDate: data.joiningDate,
        baseSalary: data.baseSalary || null,
        status: "ACTIVE",
        documentUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await empCollection.insertOne(empData)
      const emp = { _id: result.insertedId, ...empData }

      if (options.include?.user && userId) {
        const user = await usersCollection.findOne({ _id: userId })
        return {
          ...emp,
          id: emp._id.toString(),
          user: user
            ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
              }
            : null,
        }
      }

      return {
        ...emp,
        id: emp._id.toString(),
      }
    },

    async update(options: any) {
      const collection = await db.employeeProfiles()
      await collection.updateOne(
        buildIdQuery(options.where.id),
        { $set: options.data }
      )

      let emp = await collection.findOne(buildIdQuery(options.where.id))

      if (options.include?.user && emp?.userId) {
        const usersCollection = await db.users()
        const user = await usersCollection.findOne({ _id: emp.userId })
        return {
          ...emp,
          id: emp._id.toString(),
          user: user
            ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
              }
            : null,
        }
      }

      return emp
        ? {
            ...emp,
            id: emp._id.toString(),
          }
        : null
    },

    async delete(options: any) {
      const collection = await db.employeeProfiles()
      const employee = await collection.findOne(buildIdQuery(options.where.id))

      if (!employee) {
        return null
      }

      await collection.deleteOne({ _id: employee._id })

      let user = null
      if (employee.userId) {
        const usersCollection = await db.users()
        if (options.include?.user) {
          const userDoc = await usersCollection.findOne({ _id: employee.userId })
          user = userDoc
            ? {
                id: userDoc._id.toString(),
                name: userDoc.name,
                email: userDoc.email,
                phone: userDoc.phone,
                role: userDoc.role,
              }
            : null
        }
        await usersCollection.deleteOne({ _id: employee.userId })
      }

      return {
        ...employee,
        id: employee._id.toString(),
        ...(options.include?.user ? { user } : {}),
      }
    },
  },

  user: {
    async findUnique(options: any) {
      const collection = await db.users()
      let user

      if (options.where.id) {
        user = await collection.findOne({
          _id: new ObjectId(options.where.id),
        })
      } else if (options.where.email) {
        user = await collection.findOne({ email: options.where.email })
      }

      return user
        ? {
            id: user._id.toString(),
            ...user,
          }
        : null
    },

    async findMany(options?: any) {
      const collection = await db.users()
      const users = await collection.find({}).toArray()

      return users.map((user) => ({
        id: user._id.toString(),
        ...user,
      }))
    },

    async update(options: any) {
      const collection = await db.users()
      const result = await collection.updateOne(
        { _id: new ObjectId(options.where.id) },
        { $set: options.data }
      )

      const user = await collection.findOne({
        _id: new ObjectId(options.where.id),
      })

      return user
        ? {
            id: user._id.toString(),
            ...user,
          }
        : null
    },
  },

  payout: {
    async findMany(options?: any) {
      const collection = await db.payouts()
      const payouts = await collection.find({}).toArray()

      return payouts.map((payout) => ({
        id: payout._id.toString(),
        ...payout,
      }))
    },

    async findUnique(options: any) {
      const collection = await db.payouts()
      let payout

      if (options.where.id) {
        payout = await collection.findOne({
          _id: new ObjectId(options.where.id),
        })
      }

      return payout
        ? {
            id: payout._id.toString(),
            ...payout,
          }
        : null
    },

    async create(options: any) {
      const collection = await db.payouts()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },

    async update(options: any) {
      const collection = await db.payouts()
      await collection.updateOne(
        { _id: new ObjectId(options.where.id) },
        { $set: options.data }
      )

      const payout = await collection.findOne({
        _id: new ObjectId(options.where.id),
      })

      return payout
        ? {
            id: payout._id.toString(),
            ...payout,
          }
        : null
    },
  },

  target: {
    async findMany(options?: any) {
      const collection = await db.targets()
      const targets = await collection.find({}).toArray()

      return targets.map((target) => ({
        id: target._id.toString(),
        ...target,
      }))
    },

    async findUnique(options: any) {
      const collection = await db.targets()
      let target

      if (options.where.id) {
        target = await collection.findOne({
          _id: new ObjectId(options.where.id),
        })
      }

      return target
        ? {
            id: target._id.toString(),
            ...target,
          }
        : null
    },

    async create(options: any) {
      const collection = await db.targets()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },

    async update(options: any) {
      const collection = await db.targets()
      await collection.updateOne(
        { _id: new ObjectId(options.where.id) },
        { $set: options.data }
      )

      const target = await collection.findOne({
        _id: new ObjectId(options.where.id),
      })

      return target
        ? {
            id: target._id.toString(),
            ...target,
          }
        : null
    },
  },

  attendanceLog: {
    async findMany(options?: any) {
      const collection = await db.attendanceLogs()
      const logs = await collection.find({}).toArray()

      return logs.map((log) => ({
        id: log._id.toString(),
        ...log,
      }))
    },

    async create(options: any) {
      const collection = await db.attendanceLogs()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },
  },

  qrToken: {
    async findUnique(options: any) {
      const collection = await db.qrTokens()
      let token

      if (options.where.id) {
        token = await collection.findOne({
          _id: new ObjectId(options.where.id),
        })
      } else if (options.where.token) {
        token = await collection.findOne({ token: options.where.token })
      }

      return token
        ? {
            id: token._id.toString(),
            ...token,
          }
        : null
    },

    async create(options: any) {
      const collection = await db.qrTokens()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },

    async update(options: any) {
      const collection = await db.qrTokens()
      await collection.updateOne(
        { _id: new ObjectId(options.where.id) },
        { $set: options.data }
      )

      const token = await collection.findOne({
        _id: new ObjectId(options.where.id),
      })

      return token
        ? {
            id: token._id.toString(),
            ...token,
          }
        : null
    },
  },

  officeSettings: {
    async findFirst(options?: any) {
      const collection = await db.officeSettings()
      const settings = await collection.findOne({})

      return settings
        ? {
            id: settings._id.toString(),
            ...settings,
          }
        : null
    },

    async findUnique(options: any) {
      const collection = await db.officeSettings()
      let settings

      if (options.where.id) {
        settings = await collection.findOne({
          _id: new ObjectId(options.where.id),
        })
      }

      return settings
        ? {
            id: settings._id.toString(),
            ...settings,
          }
        : null
    },

    async create(options: any) {
      const collection = await db.officeSettings()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },
  },

  notification: {
    async create(options: any) {
      const collection = await db.notifications()
      const result = await collection.insertOne(options.data)

      return {
        id: result.insertedId.toString(),
        ...options.data,
      }
    },

    async findMany(options?: any) {
      const collection = await db.notifications()
      const notifs = await collection.find({}).toArray()

      return notifs.map((notif) => ({
        id: notif._id.toString(),
        ...notif,
      }))
    },
  },
}
