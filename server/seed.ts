import initializeDatabase from './db';

// Define types for database records
interface Organization {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Account {
  id: number;
  organization_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CountResult {
  count: number;
}

/**
 * Seed the database with initial data for development and testing
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  const db = initializeDatabase();
  
  try {
    db.prepare('DELETE FROM deals').run();
    db.prepare('DELETE FROM accounts').run();
    db.prepare('DELETE FROM organizations').run();
    
    console.log('Existing data cleared. Adding seed data...');
    
    const organizations = [
      { name: 'SponsorCX' },
      { name: 'Sports Team Inc.' },
      { name: 'Event Management LLC' }
    ];
    
    const insertOrganization = db.prepare(
      'INSERT INTO organizations (name) VALUES (?)'
    );
    
    organizations.forEach(org => {
      insertOrganization.run(org.name);
    });
    
    console.log('Organizations added.');
    
    const orgRows = db.prepare('SELECT * FROM organizations').all() as Organization[];
    
    const insertAccount = db.prepare(
      'INSERT INTO accounts (organization_id, name) VALUES (?, ?)'
    );
    
    const sponsorCxAccounts = [
      { name: 'Coca-Cola' },
      { name: 'Microsoft' },
      { name: 'Nike' },
      { name: 'Amazon' }
    ];
    
    sponsorCxAccounts.forEach(account => {
      insertAccount.run(orgRows[0].id, account.name);
    });
    
    const sportsTeamAccounts = [
      { name: 'Adidas' },
      { name: 'Gatorade' },
      { name: 'Under Armour' }
    ];
    
    sportsTeamAccounts.forEach(account => {
      insertAccount.run(orgRows[1].id, account.name);
    });
    
    const eventMgmtAccounts = [
      { name: 'Red Bull' },
      { name: 'IBM' }
    ];
    
    eventMgmtAccounts.forEach(account => {
      insertAccount.run(orgRows[2].id, account.name);
    });
    
    console.log('Accounts added.');
    
    const accountRows = db.prepare('SELECT * FROM accounts').all() as Account[];
    
    const insertDeal = db.prepare(
      'INSERT INTO deals (account_id, start_date, end_date, value, status) VALUES (?, ?, ?, ?, ?)'
    );
    
    const statuses = ['active', 'pending', 'completed', 'cancelled'];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };
    
    const getRandomInt = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    const getRandomDate = (startYear: number, startMonth: number, endYear: number, endMonth: number): Date => {
      const start = new Date(startYear, startMonth - 1, 1);
      const end = new Date(endYear, endMonth, 0);
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    // Create deals for each account
    accountRows.forEach(account => {
      const numDeals = getRandomInt(1, 4);
      
      for (let i = 0; i < numDeals; i++) {
        const dealValue = getRandomInt(10000, 500000);
        
        const status = statuses[getRandomInt(0, statuses.length - 1)];
        
        let startDate, endDate;
        
        if (i % 3 === 0) {
          // Past deal
          startDate = getRandomDate(currentYear - 2, 1, currentYear - 1, 12);
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (i % 3 === 1) {
          // Current deal
          startDate = getRandomDate(currentYear - 1, 1, currentYear, 3);
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          // Future deal
          startDate = getRandomDate(currentYear, currentDate.getMonth() + 1, currentYear + 1, 12);
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        
        insertDeal.run(
          account.id,
          formatDate(startDate),
          formatDate(endDate),
          dealValue,
          status
        );
      }
    });
    
    console.log('Deals added.');
    
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as CountResult;
    const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as CountResult;
    const dealCount = db.prepare('SELECT COUNT(*) as count FROM deals').get() as CountResult;
    
    console.log('Seeding completed successfully!');
    console.log(`Created ${orgCount.count} organizations`);
    console.log(`Created ${accountCount.count} accounts`);
    console.log(`Created ${dealCount.count} deals`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    db.close();
  }
}

// Run the seed function
seedDatabase().catch(console.error); 