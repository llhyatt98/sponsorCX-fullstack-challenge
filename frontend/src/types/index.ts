export interface Organization {
  id: number;
  name: string;
}

export interface Account {
  id: number;
  name: string;
  totalValue: number;
  dealsCount: number;
  deals: Deal[];
}

export interface Deal {
  id: number;
  start_date: string;
  end_date: string;
  value: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationDealsResponse {
  organization: Organization;
  totalValue: number;
  accountsCount: number;
  accounts: Account[];
} 