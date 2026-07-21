import * as bcrypt from "bcrypt";
import { prisma } from "./config/prisma";

const main = async () => {
  const username = "admin";
  const email = "admin@smartcafeubon.com";
  const password = "Admin@123456";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      username,
      fullName: "Smart Cafe Admin",
      password: hashedPassword,
      provider: "LOCAL",
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      username,
      fullName: "Smart Cafe Admin",
      email,
      password: hashedPassword,
      provider: "LOCAL",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin user created successfully");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });