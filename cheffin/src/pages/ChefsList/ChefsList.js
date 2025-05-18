import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants';
import { 
  Container, Grid, Card, CardContent, 
  Typography, Button, Box, CircularProgress,
  TextField, InputAdornment, Avatar, Divider, 
  IconButton, Zoom, Pagination, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MessageIcon from '@mui/icons-material/Message';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import './ChefsList.css';

function ChefsList() {
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [chefs, setChefs] = useState([]);
  const [randomChefs, setRandomChefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch random chefs on initial load
    fetchRandomChefs();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Search chefs when search term changes or page changes
  useEffect(() => {
    if (!initialLoading) {
      const delayDebounceFn = setTimeout(() => {
        fetchChefs();
      }, 500);
      
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, page]);
  
  const fetchRandomChefs = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`${endpoint}/users/chefs/random?count=6`);
      setRandomChefs(response.data);
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching random chefs:', error);
      setInitialLoading(false);
    }
  };
  
  const fetchChefs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${endpoint}/users/chefs/search`, {
        params: {
          query: searchTerm,
          page: page,
          size: pageSize
        }
      });
      
      setChefs(response.data.chefs);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chefs:', error);
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when search term changes
  };
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); // MaterialUI Pagination is 1-indexed, but our API is 0-indexed
  };
  
  const handleChefProfile = (username) => {
    navigate(`/chef/${username}`);
  };
  
  const handleStartChat = (username) => {
    if (isAuthenticated()) {
      navigate(`/chat/${username}`);
    } else {
      navigate('/login');
    }
  };
  
  // Show the chefs to display based on search state
  const displayChefs = searchTerm.length > 0 || page > 0 ? chefs : randomChefs;
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#F16A2D' }} />
      </Box>
    );
  }
  
  return (
    <Box className="chefs-list-page" sx={{ pb: 8, pt: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: '#333'
            }}
          >
            Discover Amazing Chefs
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              maxWidth: '800px', 
              mx: 'auto',
              color: '#666'
            }}
          >
            Find the perfect chef for your next culinary experience or get inspired by their creations
          </Typography>
          
          {/* Search Bar */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 0.5, 
              borderRadius: '50px',
              maxWidth: '600px',
              mx: 'auto',
              mb: 2
            }}
            className="search-input-wrapper"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search chefs by name, specialty or bio..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '50px',
                  '& fieldset': { border: 'none' },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#F16A2D', ml: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      sx={{ mr: 1 }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>
          
          {!searchTerm && page === 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing random chefs. Search or browse pages to see more.
            </Typography>
          )}
        </Box>
        
        {/* Loading state for search/pagination */}
        {loading && (searchTerm.length > 0 || page > 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#F16A2D' }} />
          </Box>
        ) : (
          <>
            {/* Chefs Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {displayChefs.length > 0 ? (
                displayChefs.map((chef, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={chef.id}>
                    <Zoom in={true} style={{ transitionDelay: `${100 * index}ms` }}>
                      <Card 
                        className="chef-card" 
                        sx={{ 
                          borderRadius: '12px',
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                        }}
                      >
                        <Box 
                          sx={{ 
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%)',
                            height: 120,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Avatar 
                            src={chef.profilePicture || '/icons/chef-hat.svg'}
                            sx={{ 
                              width: 90, 
                              height: 90, 
                              border: '4px solid white',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'center', pb: '16px !important' }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                            }}
                          >
                            {chef.username}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <RestaurantMenuIcon fontSize="small" sx={{ mr: 0.5, color: '#F16A2D' }} />
                            {chef.specialty || 'Master Chef'}
                          </Typography>
                          
                          {chef.bio && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mt: 1, 
                                mb: 'auto',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {chef.bio}
                            </Typography>
                          )}
                          
                          <Divider sx={{ mt: 'auto', mb: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Button 
                              variant="outlined" 
                              size="medium"
                              onClick={() => handleChefProfile(chef.username)}
                              sx={{ 
                                borderColor: '#F16A2D', 
                                color: '#F16A2D',
                                '&:hover': { borderColor: '#d45c26', color: '#d45c26' },
                                borderRadius: '20px',
                                px: 2
                              }}
                            >
                              Profile
                            </Button>
                            <Button 
                              variant="contained" 
                              size="medium"
                              startIcon={<MessageIcon />}
                              onClick={() => handleStartChat(chef.username)}
                              sx={{ 
                                bgcolor: '#F16A2D', 
                                '&:hover': { bgcolor: '#d45c26' },
                                borderRadius: '20px',
                                px: 2
                              }}
                            >
                              Chat
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))
              ) : (
                <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                  <img 
                    src="/icons/chef-hat.svg" 
                    alt="Chef hat" 
                    style={{ width: 80, opacity: 0.5, marginBottom: 20 }} 
                  />
                  <Typography variant="h6" color="text.secondary">
                    No chefs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'Try different search terms' : 'Check back soon for new chefs'}
                  </Typography>
                  {searchTerm && (
                    <Button
                      variant="outlined"
                      onClick={() => setSearchTerm('')}
                      sx={{ mt: 2, borderColor: '#F16A2D', color: '#F16A2D' }}
                    >
                      Clear Search
                    </Button>
                  )}
                </Box>
              )}
            </Grid>
            
            {/* Pagination */}
            {(searchTerm.length > 0 || page > 0) && totalPages > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page + 1} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton 
                  showLastButton
                  classes={{ ul: 'pagination-container' }}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#666',
                      '&.Mui-selected': {
                        backgroundColor: '#F16A2D',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#d45c26',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(241, 106, 45, 0.1)',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default ChefsList;
