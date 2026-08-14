import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../config/dbConnect.js';
import { Role } from '@prisma/client';

async function seed() {
    const adminHash = await bcrypt.hash('adminpassword', 10);
    const userHash = await bcrypt.hash('userpassword', 10);
    const premiumUserHash = await bcrypt.hash('premiumuserpassword', 10);

    const testEmails = ["admin@example.com", "user@example.com", "premiumuser@example.com"];

    console.log("Cleaning up existing test accounts...");
    await prisma.user.deleteMany({
        where: { email: { in: testEmails } }
    });

    console.log("Inserting seeded accounts...");

    // 1. Insert Admin
    await prisma.user.create({
        data: {
            firstname: "Admin",
            lastname: "System",
            email: "admin@example.com",
            phone: "+10000000000",
            passwordHash: adminHash,
            role: Role.admin,
            lastLogin: new Date()
        }
    });

    // 2. Insert Regular User
    await prisma.user.create({
        data: {
            firstname: "Demo",
            lastname: "User",
            email: "user@example.com",
            phone: "+10000000001",
            passwordHash: userHash,
            role: Role.user,
            lastLogin: new Date()
        }
    });

    // 3. Insert Premium User
    await prisma.user.create({
        data: {
            firstname: "Premium",
            lastname: "User",
            email: "premiumuser@example.com",
            phone: "+10000000002",
            passwordHash: premiumUserHash,
            role: Role.premium_user,
            lastLogin: new Date()
        }
    });

    console.log("✓ Demo users seeded successfully:");
    console.log("   - Admin:   admin@example.com       / adminpassword");
    console.log("   - User:    user@example.com        / userpassword");
    console.log("   - Premium: premiumuser@example.com / premiumuserpassword");
}

seed()
    .catch((e) => {
        console.error("Error seeding demo users:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });