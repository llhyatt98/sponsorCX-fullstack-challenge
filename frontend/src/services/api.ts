import { Organization, OrganizationDealsResponse } from '../types';

const API_URL = 'http://localhost:3000';

export const fetchOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await fetch(`${API_URL}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }
    const data = await response.json();
    return data.rows;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

export const fetchOrganizationDeals = async (
  organizationId: number,
  status?: string,
  year?: number
): Promise<OrganizationDealsResponse> => {
  try {
    let url = `${API_URL}/api/organizations/${organizationId}/deals`;
    
    // Add query parameters if filters are provided
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch organization deals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching organization deals:', error);
    throw error;
  }
}; 