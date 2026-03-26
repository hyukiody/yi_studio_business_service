// prisma/seed.ts
// Seed database with sample data (development only)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample contact submissions
  const contact1 = await prisma.contactSubmission.create({
    data: {
      emailHash: 'sample_hash_001',
      name: 'John Doe',
      message: 'This is a test contact submission.',
      captchaValidated: true,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    },
  });

  console.log('✅ Seeded contact:', contact1.id);

  // Create sample telemetry events
  const telemetry1 = await prisma.telemetryEvent.create({
    data: {
      eventName: 'click_whatsapp_button',
      eventType: 'click',
      componentId: 'whatsapp-button',
      sessionId: 'session_sample_001',
      metadata: { phoneNumber: '+62***' },
    },
  });

  console.log('✅ Seeded telemetry event:', telemetry1.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
