const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateNumberFormats() {
  console.log('Starting migration of member and visitor numbers...');
  
  // Migrate member numbers
  const members = await prisma.member.findMany();
  console.log(`Found ${members.length} members to migrate`);
  
  let memberCounter = 101; // Starting from 00101
  
  for (const member of members) {
    // Format the member number to have 5 digits with leading zeros
    const formattedNumber = memberCounter.toString().padStart(5, '0');
    
    try {
      await prisma.member.update({
        where: { id: member.id },
        data: { memberNumber: formattedNumber }
      });
      console.log(`Updated member ${member.id} number to ${formattedNumber}`);
      memberCounter++;
    } catch (error) {
      console.error(`Error updating member ${member.id}:`, error);
    }
  }
  
  // Migrate visitor numbers
  const visitors = await prisma.visitor.findMany();
  console.log(`Found ${visitors.length} visitors to migrate`);
  
  let visitorCounter = 101; // Starting from V00101
  
  for (const visitor of visitors) {
    // Format the visitor number with V prefix and 5 digits with leading zeros
    const formattedNumber = 'V' + visitorCounter.toString().padStart(5, '0');
    
    try {
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: { visitorNumber: formattedNumber }
      });
      console.log(`Updated visitor ${visitor.id} number to ${formattedNumber}`);
      visitorCounter++;
    } catch (error) {
      console.error(`Error updating visitor ${visitor.id}:`, error);
    }
  }
  
  console.log('Migration completed!');
}

migrateNumberFormats()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 