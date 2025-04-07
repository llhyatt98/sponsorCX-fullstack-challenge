import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  alpha,
  useTheme,
  Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Account } from '../types';
import { useState } from 'react';

interface AccountDealsProps {
  accounts: Account[];
}

const AccountDeals = ({ accounts }: AccountDealsProps) => {
  const theme = useTheme();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());
  
  const handleAccordionChange = (accountId: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccounts(prev => {
      const newExpanded = new Set(prev);
      if (isExpanded) {
        newExpanded.add(accountId);
      } else {
        newExpanded.delete(accountId);
      }
      return newExpanded;
    });
  };
  
  return (
    <Stack spacing={1.5}>
      {accounts.map(account => (
        <Accordion 
          key={account.id}
          expanded={expandedAccounts.has(account.id)}
          onChange={handleAccordionChange(account.id)}
          sx={{
            borderRadius: 1.5,
            boxShadow: expandedAccounts.has(account.id) ? 2 : 1,
            '&:before': { display: 'none' },
            overflow: 'hidden',
            transition: 'all 0.2s',
            border: `1px solid ${alpha(theme.palette.primary.main, expandedAccounts.has(account.id) ? 0.2 : 0.05)}`,
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: expandedAccounts.has(account.id) ? 'white' : alpha(theme.palette.background.default, 0.7)
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`account-${account.id}-content`}
            id={`account-${account.id}-header`}
            sx={{
              backgroundColor: expandedAccounts.has(account.id) ? alpha(theme.palette.background.default, 0.5) : 'transparent',
              '&:hover': {
                backgroundColor: expandedAccounts.has(account.id) ? alpha(theme.palette.background.default, 0.8) : alpha(theme.palette.background.default, 0.3)
              }
            }}
          >
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              width="100%"
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography 
                  variant="subtitle1" 
                  fontWeight={expandedAccounts.has(account.id) ? 'bold' : 'medium'}
                >
                  {account.name}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Badge badgeContent={account.dealsCount} color="primary" max={99}>
                  <ReceiptLongIcon color="action" fontSize="small" />
                </Badge>
                
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AttachMoneyIcon fontSize="small" color="secondary" />
                  <Typography variant="subtitle2" color="secondary.dark" fontWeight="bold">
                    {account.totalValue.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none', borderRadius: 0 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {account.deals.map(deal => (
                    <TableRow 
                      key={deal.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          bgcolor: alpha(theme.palette.primary.light, 0.02)
                        },
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.light, 0.07)
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>{deal.id}</TableCell>
                      <TableCell>{new Date(deal.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(deal.end_date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ color: 'secondary.dark', fontWeight: 'medium' }}>
                        ${deal.value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={deal.status} 
                          size="small" 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 'medium',
                            bgcolor: deal.status === 'active' ? 'success.light' : 
                                    deal.status === 'pending' ? 'warning.light' :
                                    deal.status === 'completed' ? 'info.light' : 'error.light',
                            color: deal.status === 'active' ? 'success.dark' : 
                                  deal.status === 'pending' ? 'warning.dark' :
                                  deal.status === 'completed' ? 'info.dark' : 'error.dark',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

export default AccountDeals; 