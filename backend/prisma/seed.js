import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding başlıyor...');

  // Language verilerini ekle
  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'İngilizce' },
    { code: 'zh-Hans', name: 'Çince (Basitleştirilmiş)' }
  ];

  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {},
      create: language
    });
    console.log(`✓ ${language.name} eklendi`);
  }

  console.log('Seeding tamamlandı!');
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
