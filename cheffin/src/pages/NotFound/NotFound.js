import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md" className="not-found-container">
      <Paper elevation={3} className="not-found-paper">
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <img 
            src="/icons/chef-hat.svg" 
            alt="Chef Hat" 
            className="not-found-image"
          />
          
          <Typography variant="h3" gutterBottom>
            404 - Page Not Found
          </Typography>
          
          <Typography variant="body1" paragraph>
            We couldn't find the page you were looking for. Perhaps this dish isn't on our menu.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{ mt: 3, bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default NotFound;