import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import initializeDatabase from "./db";
import { Database } from "better-sqlite3";

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

interface Deal {
  id: number;
  account_id: number;
  start_date: string;
  end_date: string;
  value: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Initialize app and database
const app = express();
const port = process.env.PORT || 3000;
const db = initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM organizations").all() as Organization[];
  res.json({ message: "Welcome to the server! 🎉", rows });
});

/**
 * Get all accounts and their deals for a specific organization
 * Returns data formatted for accordion-style UI rendering
 */
function getOrganizationDeals(req: Request, res: Response): void {
  try {
    const { organizationId } = req.params;
    const { status, year } = req.query;
    
    if (!organizationId || isNaN(Number(organizationId))) {
      res.status(400).json({ error: "Invalid organization ID" });
      return;
    }
    
    const organization = db.prepare(
      "SELECT * FROM organizations WHERE id = ?"
    ).get(organizationId) as Organization | undefined;
    
    if (!organization) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    
    const accounts = db.prepare(
      "SELECT * FROM accounts WHERE organization_id = ?"
    ).all(organizationId) as Account[];
    
    // For each account, get its deals with filters
    const accountsWithDeals = accounts.map((account: Account) => {
      let query = `
        SELECT 
          id, 
          start_date, 
          end_date, 
          value, 
          status, 
          created_at, 
          updated_at 
        FROM deals 
        WHERE account_id = ?
      `;
      
      const queryParams: any[] = [account.id];
      
      // Add status filter if provided
      if (status) {
        query += " AND status = ?";
        queryParams.push(status);
      }
      
      // Add year filter if provided
      if (year && !isNaN(Number(year))) {
        query += " AND (strftime('%Y', start_date) = ? OR strftime('%Y', end_date) = ? OR (strftime('%Y', start_date) < ? AND strftime('%Y', end_date) > ?))";
        const yearStr = year.toString();
        queryParams.push(yearStr, yearStr, yearStr, yearStr);
      }
      
      const deals = db.prepare(query).all(...queryParams) as Deal[];
      
      // Calculate total value of deals for this account
      const totalValue = deals.reduce((sum: number, deal: Deal) => sum + Number(deal.value), 0);
      
      return {
        id: account.id,
        name: account.name,
        totalValue,
        dealsCount: deals.length,
        deals
      };
    });
    
    // Filter out accounts with no deals if filters are applied
    const filteredAccounts = (status || year) 
      ? accountsWithDeals.filter(account => account.dealsCount > 0) 
      : accountsWithDeals;
    
    // Calculate overall total value across all accounts
    const organizationTotalValue = filteredAccounts.reduce(
      (sum: number, account: { totalValue: number }) => sum + account.totalValue, 
      0
    );
    
    res.json({
      organization: {
        id: organization.id,
        name: organization.name
      },
      totalValue: organizationTotalValue,
      accountsCount: filteredAccounts.length,
      accounts: filteredAccounts
    });
  } catch (error) {
    console.error("Error fetching organization deals:", error);
    res.status(500).json({ error: "Failed to fetch organization deals" });
  }
}

app.get("/api/organizations/:organizationId/deals", getOrganizationDeals);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
