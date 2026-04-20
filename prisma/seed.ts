import { PrismaClient } from "../src/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding real users into database...");

  const usersToSeed = [
    { name: "Tharun", role: "ADMIN" as const },
    { name: "Prabhu Sir", role: "PURCHASE_HEAD" as const },
    { name: "Rajesh Sir", role: "STORE" as const },
    { name: "Mech Head", role: "MECH_HEAD" as const },
    { name: "Electrical Head", role: "ELEC_HEAD" as const },
    { name: "Owner", role: "OWNER" as const },
  ];

  for (const user of usersToSeed) {
    // We try to find the user by name to update or create
    const existing = await prisma.employee.findFirst({
      where: { name: user.name }
    });

    if (existing) {
      await prisma.employee.update({
        where: { id: existing.id },
        data: { role: user.role }
      });
      console.log(`Updated ${user.name} to role ${user.role}`);
    } else {
      await prisma.employee.create({
        data: { name: user.name, role: user.role }
      });
      console.log(`Created ${user.name} with role ${user.role}`);
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
