import { AppBar, Toolbar, Typography, Container } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Container maxWidth="lg">
          <Typography variant="h6" component="div">
            SponsorCX Deals Dashboard
          </Typography>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 