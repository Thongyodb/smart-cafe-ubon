import "dotenv/config";
import { prisma } from "./config/prisma";

async function main() {
  console.log("Start seeding Smart Cafe Ubon data...");

  const cafeCategory = await prisma.category.upsert({
    where: { name: "Cafe" },
    update: {},
    create: {
      name: "Cafe",
      description: "ร้านคาเฟ่สำหรับกาแฟ เครื่องดื่ม และถ่ายรูป",
    },
  });

  const dessertCategory = await prisma.category.upsert({
    where: { name: "Dessert" },
    update: {},
    create: {
      name: "Dessert",
      description: "ร้านขนมหวาน เบเกอรี่ และเครื่องดื่ม",
    },
  });

  const muang = await prisma.district.upsert({
    where: { name: "เมืองอุบลราชธานี" },
    update: {},
    create: {
      name: "เมืองอุบลราชธานี",
    },
  });

  const warin = await prisma.district.upsert({
    where: { name: "วารินชำราบ" },
    update: {},
    create: {
      name: "วารินชำราบ",
    },
  });

  const tags = [
    { name: "Minimal", type: "STYLE" as const },
    { name: "Vintage", type: "STYLE" as const },
    { name: "Japanese", type: "STYLE" as const },
    { name: "White Tone", type: "COLOR" as const },
    { name: "Brown Tone", type: "COLOR" as const },
    { name: "Garden", type: "VIEW" as const },
    { name: "River", type: "VIEW" as const },
    { name: "Morning", type: "TIME" as const },
    { name: "Evening", type: "TIME" as const },
    { name: "Photo Spot", type: "FEATURE" as const },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: {
        name_type: {
          name: tag.name,
          type: tag.type,
        },
      },
      update: {},
      create: tag,
    });
  }

  const cafe1 = await prisma.cafe.upsert({
    where: { slug: "minimal-garden-cafe" },
    update: {},
    create: {
      name: "Minimal Garden Cafe",
      slug: "minimal-garden-cafe",
      description: "คาเฟ่สไตล์มินิมอล มีสวนสวย เหมาะกับการถ่ายรูปช่วงเช้า",
      address: "อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี",
      latitude: 15.2287,
      longitude: 104.8564,
      openTime: "09:00",
      closeTime: "18:00",
      phone: "0800000001",
      coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
      priceMin: 60,
      priceMax: 180,
      categoryId: cafeCategory.id,
      districtId: muang.id,
      averageRating: 4.8,
      totalReviews: 12,
      totalViews: 150,
    },
  });

  const cafe2 = await prisma.cafe.upsert({
    where: { slug: "river-view-coffee" },
    update: {},
    create: {
      name: "River View Coffee",
      slug: "river-view-coffee",
      description: "คาเฟ่ริมแม่น้ำ บรรยากาศดี เหมาะสำหรับถ่ายรูปช่วงเย็น",
      address: "อำเภอวารินชำราบ จังหวัดอุบลราชธานี",
      latitude: 15.1935,
      longitude: 104.8622,
      openTime: "08:30",
      closeTime: "19:00",
      phone: "0800000002",
      coverImageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      priceMin: 70,
      priceMax: 220,
      categoryId: cafeCategory.id,
      districtId: warin.id,
      averageRating: 4.6,
      totalReviews: 9,
      totalViews: 120,
    },
  });

  const cafe3 = await prisma.cafe.upsert({
    where: { slug: "sweet-dessert-house" },
    update: {},
    create: {
      name: "Sweet Dessert House",
      slug: "sweet-dessert-house",
      description: "ร้านขนมหวานและเบเกอรี่ โทนขาวน่ารัก เหมาะกับสายถ่ายรูป",
      address: "อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี",
      latitude: 15.2441,
      longitude: 104.8477,
      openTime: "10:00",
      closeTime: "20:00",
      phone: "0800000003",
      coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      priceMin: 80,
      priceMax: 250,
      categoryId: dessertCategory.id,
      districtId: muang.id,
      averageRating: 4.7,
      totalReviews: 15,
      totalViews: 210,
    },
  });

  const minimal = await prisma.tag.findUnique({
    where: { name_type: { name: "Minimal", type: "STYLE" } },
  });

  const garden = await prisma.tag.findUnique({
    where: { name_type: { name: "Garden", type: "VIEW" } },
  });

  const river = await prisma.tag.findUnique({
    where: { name_type: { name: "River", type: "VIEW" } },
  });

  const white = await prisma.tag.findUnique({
    where: { name_type: { name: "White Tone", type: "COLOR" } },
  });

  const evening = await prisma.tag.findUnique({
    where: { name_type: { name: "Evening", type: "TIME" } },
  });

  const cafeTagData = [
    { cafeId: cafe1.id, tagId: minimal?.id },
    { cafeId: cafe1.id, tagId: garden?.id },
    { cafeId: cafe2.id, tagId: river?.id },
    { cafeId: cafe2.id, tagId: evening?.id },
    { cafeId: cafe3.id, tagId: white?.id },
    { cafeId: cafe3.id, tagId: minimal?.id },
  ];

  for (const item of cafeTagData) {
    if (!item.tagId) continue;

    await prisma.cafeTag.upsert({
      where: {
        cafeId_tagId: {
          cafeId: item.cafeId,
          tagId: item.tagId,
        },
      },
      update: {},
      create: {
        cafeId: item.cafeId,
        tagId: item.tagId,
      },
    });
  }

  await prisma.photoSpot.createMany({
    data: [
      {
        cafeId: cafe1.id,
        name: "สวนหน้าร้าน",
        description: "มุมสวนโทนเขียว เหมาะกับถ่ายรูปช่วงเช้า",
        bestTime: "08:30 - 10:30",
        cameraAngle: "ถ่ายมุมกว้างจากด้านหน้าร้าน",
      },
      {
        cafeId: cafe2.id,
        name: "ริมแม่น้ำ",
        description: "มุมถ่ายรูปพระอาทิตย์ตก เหมาะกับช่วงเย็น",
        bestTime: "17:00 - 18:30",
        cameraAngle: "ถ่ายย้อนแสงช่วง Golden Hour",
      },
      {
        cafeId: cafe3.id,
        name: "หน้าต่างโทนขาว",
        description: "มุมยอดนิยมสำหรับถ่ายรูปสไตล์มินิมอล",
        bestTime: "10:00 - 12:00",
        cameraAngle: "ถ่ายครึ่งตัวข้างหน้าต่าง",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });