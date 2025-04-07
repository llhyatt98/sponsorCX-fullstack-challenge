import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  CircularProgress, 
  Select,
  SelectChangeEvent,
  MenuItem, 
  FormControl, 
  InputLabel,
  Stack,
  Paper,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { fetchOrganizations, fetchOrganizationDeals } from '../services/api';
import { Organization, OrganizationDealsResponse } from '../types';
import AccountDeals from './AccountDeals';

const OrganizationDeals = () => {
  const theme = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track expanded organization panels and their loaded deals
  const [expandedOrgs, setExpandedOrgs] = useState<Set<number>>(new Set());
  const [organizationDeals, setOrganizationDeals] = useState<Record<number, OrganizationDealsResponse>>({});
  const [loadingDeals, setLoadingDeals] = useState<Record<number, boolean>>({});
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  
  // Available years for filtering (current year - 2 to current year + 2)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data);
        setError(null);
      } catch (err) {
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrganizations();
  }, []);
  
  // Effect to reload deals when filters change for all expanded organizations
  useEffect(() => {
    expandedOrgs.forEach(orgId => {
      loadOrganizationDeals(orgId);
    });
    
    // Update total stats whenever organization deals change
    updateTotalStats();
  }, [statusFilter, yearFilter, expandedOrgs]);
  
  // Update total stats based on loaded organization deals
  const updateTotalStats = () => {
    let totalAccounts = 0;
    let totalDeals = 0;
    let totalValue = 0;
    
    Object.values(organizationDeals).forEach(orgDeals => {
      totalAccounts += orgDeals.accountsCount;
      totalValue += orgDeals.totalValue;
      
      orgDeals.accounts.forEach(account => {
        totalDeals += account.dealsCount;
      });
    });
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (organizationId: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedOrgs(prev => {
      const newExpanded = new Set(prev);
      if (isExpanded) {
        newExpanded.add(organizationId);
        // Load deals if not already loaded
        if (!organizationDeals[organizationId]) {
          loadOrganizationDeals(organizationId);
        }
      } else {
        newExpanded.delete(organizationId);
      }
      return newExpanded;
    });
  };
  
  // Load organization deals with filters
  const loadOrganizationDeals = async (organizationId: number) => {
    if (loadingDeals[organizationId]) return;
    
    setLoadingDeals(prev => ({ ...prev, [organizationId]: true }));
    
    try {
      const status = statusFilter || undefined;
      const year = yearFilter ? parseInt(yearFilter) : undefined;
      const deals = await fetchOrganizationDeals(organizationId, status, year);
      
      setOrganizationDeals(prev => ({
        ...prev,
        [organizationId]: deals
      }));
    } catch (err) {
      console.error('Error loading deals:', err);
    } finally {
      setLoadingDeals(prev => ({ ...prev, [organizationId]: false }));
    }
  };
  
  // Handle filter changes
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };
  
  const handleYearFilterChange = (event: SelectChangeEvent<string>) => {
    setYearFilter(event.target.value);
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'visible' }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <FilterAltIcon color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Stack>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Filter by Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'success.light', 
                        color: 'success.dark',
                        mr: 1
                      }} 
                    />
                    Active
                  </MenuItem>
                  <MenuItem value="pending">
                    <Chip 
                      label="Pending" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'warning.light', 
                        color: 'warning.dark',
                        mr: 1
                      }} 
                    />
                    Pending
                  </MenuItem>
                  <MenuItem value="completed">
                    <Chip 
                      label="Completed" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'info.light', 
                        color: 'info.dark',
                        mr: 1
                      }} 
                    />
                    Completed
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Chip 
                      label="Cancelled" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'error.light', 
                        color: 'error.dark',
                        mr: 1
                      }} 
                    />
                    Cancelled
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="year-filter-label">Filter by Year</InputLabel>
                <Select
                  labelId="year-filter-label"
                  value={yearFilter}
                  onChange={handleYearFilterChange}
                  label="Filter by Year"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {availableYears.map(year => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
          
          {(statusFilter || yearFilter) && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
                {statusFilter && (
                  <Chip 
                    label={`Status: ${statusFilter}`} 
                    size="small" 
                    onDelete={() => setStatusFilter('')}
                    sx={{ ml: 1 }}
                  />
                )}
                {yearFilter && (
                  <Chip 
                    label={`Year: ${yearFilter}`} 
                    size="small" 
                    onDelete={() => setYearFilter('')}
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Organizations Accordions */}
      {organizations.length === 0 ? (
        <Typography>No organizations found.</Typography>
      ) : (
        <Stack spacing={2}>
          {organizations.map(org => (
            <Accordion 
              key={org.id}
              expanded={expandedOrgs.has(org.id)}
              onChange={handleAccordionChange(org.id)}
              sx={{
                borderRadius: 2,
                '&:before': { display: 'none' },
                boxShadow: expandedOrgs.has(org.id) ? 3 : 1,
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  bgcolor: expandedOrgs.has(org.id) ? 'white' : alpha(theme.palette.primary.light, 0.03)
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`org-${org.id}-content`}
                id={`org-${org.id}-header`}
                sx={{
                  backgroundColor: expandedOrgs.has(org.id) ? alpha(theme.palette.primary.light, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: expandedOrgs.has(org.id) ? alpha(theme.palette.primary.light, 0.15) : alpha(theme.palette.primary.light, 0.05)
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" fontWeight={expandedOrgs.has(org.id) ? 'bold' : 'medium'}>
                    {org.name}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, py: 2 }}>
                {loadingDeals[org.id] ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : organizationDeals[org.id] ? (
                  <Box>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        bgcolor: alpha(theme.palette.secondary.light, 0.1),
                        borderLeft: `3px solid ${theme.palette.secondary.main}`,
                        borderRadius: 1
                      }}
                    >
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                      >
                        <Typography variant="h5" color="secondary.dark" fontWeight="bold">
                          Total Value: ${organizationDeals[org.id].totalValue.toLocaleString()}
                        </Typography>
                        
                        <Box>
                          <Chip 
                            label={`${organizationDeals[org.id].accountsCount} accounts`} 
                            color="primary" 
                            variant="outlined" 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={statusFilter || "All statuses"} 
                            color="secondary" 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </Paper>
                    
                    {organizationDeals[org.id].accounts.length === 0 ? (
                      <Typography>No accounts found for this organization.</Typography>
                    ) : (
                      <AccountDeals accounts={organizationDeals[org.id].accounts} />
                    )}
                  </Box>
                ) : (
                  <Typography color="error">Failed to load deals for this organization.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default OrganizationDeals; 