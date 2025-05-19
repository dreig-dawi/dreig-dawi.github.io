import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants';
import { 
  Container, Grid, Card, CardMedia, CardContent, 
  Typography, Button, Box, CircularProgress,
  TextField, InputAdornment, Avatar, Chip,
  Paper, Divider, IconButton, Fade, Zoom, Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StarIcon from '@mui/icons-material/Star';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { Image } from 'primereact/image';
import ImageGalleria from '../../components/ImageGalleria/ImageGalleria';
import './Home.css';

function Home() {
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);  const [pageSize] = useState(9);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Define fetchRandomData first using useCallback so it can be referenced in useEffect
  const fetchRandomData = useCallback(async () => {
    try {
      setInitialLoading(true);
      // Fetch all posts and select 9 random ones
      const postResponse = await axios.get(`${endpoint}/post`);
      // Shuffle posts array and take first 9 items
      const shuffledPosts = postResponse.data
        .sort(() => 0.5 - Math.random())
        .slice(0, 9);
      setRandomPosts(shuffledPosts);
      
      // Calculate total pages for all posts (for pagination)
      const calculatedTotalPages = Math.ceil(postResponse.data.length / pageSize);
      setTotalPages(calculatedTotalPages);
      
      // Fetch featured chefs
      const chefsResponse = await axios.get(`${endpoint}/users/chefs/featured`);
      setChefs(chefsResponse.data);
      
      setInitialLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching random data:', error);
      setInitialLoading(false);
      setLoading(false);
    }
  }, [pageSize]);
  
  // Define fetchAllPosts using useCallback so it can be referenced in useEffect
  const fetchAllPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all posts for search and implement client-side pagination
      const postResponse = await axios.get(`${endpoint}/post`);
      const allPosts = postResponse.data;
      
      const filteredPosts = searchTerm 
        ? allPosts.filter(post => 
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.username?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allPosts;
      
      // Calculate total pages based on filtered results
      const calculatedTotalPages = Math.ceil(filteredPosts.length / pageSize);
      setTotalPages(calculatedTotalPages);
      
      // Get current page subset
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      setPosts(paginatedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all posts:', error);
      setLoading(false);
    }
  }, [searchTerm, page, pageSize]);
  useEffect(() => {
    // Fetch random posts and chefs on initial load
    fetchRandomData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [fetchRandomData]);

  // Search posts when search term changes or page changes
  useEffect(() => {
    if (!initialLoading && (searchTerm || page > 0)) {
      const delayDebounceFn = setTimeout(() => {
        fetchAllPosts();
      }, 500);
      
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, initialLoading, page, fetchAllPosts]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when search term changes
  };
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); // MaterialUI Pagination is 1-indexed, but our logic is 0-indexed
    window.scrollTo(0, 0); // Scroll to top when changing page
  };
  
  // Display random posts if no search term and page is 0, otherwise use paginated posts
  const displayPosts = (searchTerm || page > 0) ? posts : randomPosts;
  
  const handleChefProfile = (username) => {
    navigate(`/chef/${username}`);
  };
  
  const handleStartChat = (username) => {
    if (isAuthenticated()) {
      // Prevent chatting with yourself
      if (currentUser && username === currentUser.username) {
        navigate('/chat');
        return;
      }
      navigate(`/chat/${username}`);
    } else {
      navigate('/login');
    }
  };
    if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#F16A2D' }} />
      </Box>
    );
  }
  
  return (
    <Box className="Home" sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Hero Banner with Background Image */}
      <Box 
        sx={{ 
          position: 'relative',
          height: '60vh',
          minHeight: '400px',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(/images/home-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Zoom in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: { xs: '2.5rem', md: '4rem' }
                }}
              >
                Connect with Top Chefs
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 300,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  maxWidth: '800px',
                  mx: 'auto'
                }}
              >
                Elevate your dining experience with personalized culinary creations from professional chefs in your area
              </Typography>
              <Box sx={{ mt: 4 }}>
                {!isAuthenticated() ? (
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      bgcolor: '#F16A2D', 
                      '&:hover': { bgcolor: '#d45c26' },
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: '30px',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(241, 106, 45, 0.5)'
                    }}
                  >
                    Join Cheffin Today
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<RestaurantMenuIcon />}
                    onClick={() => navigate('/chefs')}
                    sx={{ 
                      bgcolor: '#F16A2D', 
                      '&:hover': { bgcolor: '#d45c26' },
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: '30px',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(241, 106, 45, 0.5)'
                    }}
                  >
                    Explore Chefs Near You
                  </Button>
                )}
              </Box>
            </Box>
          </Zoom>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Search Bar */}
        <Fade in={true} timeout={1500}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 0.5, 
              mb: 6, 
              borderRadius: '50px',
              maxWidth: '800px',
              mx: 'auto',
              mt: -8,
              position: 'relative',
              zIndex: 2
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for recipes, chefs, or ingredients..."
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
              }}
            />
          </Paper>
        </Fade>
        
        {/* Featured Chefs Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                Featured Chefs
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -10, 
                    left: 0, 
                    width: '60px', 
                    height: '4px', 
                    bgcolor: '#F16A2D' 
                  }} 
                />
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Meet our top culinary masters ready to craft amazing experiences for you
              </Typography>
            </Box>
            
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#F16A2D', 
                color: '#F16A2D',
                '&:hover': { borderColor: '#d45c26', color: '#d45c26' }
              }}
              onClick={() => navigate('/chefs')}
            >
              View All Chefs
            </Button>
          </Box>
          
          <Grid container spacing={3} sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', justifyContent: 'center' }}>
            {chefs.length > 0 ? (
              chefs.map((chef, index) => (
                <Grid item xs={12} sm={6} md={3} key={chef.id}>
                  <Zoom in={true} style={{ transitionDelay: `${200 * index}ms` }}>
                    <Card 
                      className="chef-card" 
                      sx={{ 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'relative',
                          background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%)',
                          height: 140,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Avatar 
                          src={chef.profilePicture || '/icons/chef-hat.svg'}
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            border: '4px solid white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                          }}
                        />
                      </Box>
                      <CardContent sx={{ textAlign: 'center', pb: '16px !important' }}>
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
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <RestaurantMenuIcon fontSize="small" sx={{ mr: 0.5, color: '#F16A2D' }} />
                          {chef.specialty || 'Master Chef'}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
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
                  No featured chefs yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Check back soon for our featured culinary professionals
                </Typography>
              </Box>
            )}
          </Grid>
        </Box>
          {/* Recent Posts Feed */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                Latest Culinary Creations
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -10, 
                    left: 0, 
                    width: '60px', 
                    height: '4px', 
                    bgcolor: '#F16A2D' 
                  }} 
                />
              </Typography>              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                {searchTerm ? 'Search results' : 'Discover 9 random culinary masterpieces from our chefs'}
              </Typography>
            </Box>
          </Box>          {/* Loading state or content */}
          {loading && searchTerm ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#F16A2D' }} />
            </Box>
          ) : (
            <>
              {/* Posts grid */}
              <Grid container spacing={2} sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', justifyContent: 'center' }}>
                {displayPosts?.length > 0 ? (
                  displayPosts.map((post, index) => (
                    <Grid item xs={12} md={6} lg={6} key={post.id}>
                      <Fade in={true} timeout={1000} style={{ transitionDelay: `${150 * index}ms` }}>
                        <Card 
                          className="post-card" 
                          sx={{ 
                            borderRadius: '12px',
                            overflow: 'hidden',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }}
                        >                      
                          <CardMedia
                            component="div"
                            sx={{ 
                              position: 'relative',
                              height: '100%',
                              width: '100%',
                              maxWidth: '800px',
                              margin: '0 auto',
                              overflow: 'hidden',
                              paddingLeft: '180px',
                              paddingRight: '180px',
                              paddingTop: '200px',
                              paddingBottom: '200px',
                            }}
                          >
                            {post.contentImages && post.contentImages.length > 0 ? (
                              post.contentImages.length > 1 ? (
                                <ImageGalleria 
                                  images={post.contentImages} 
                                  title={post.title} 
                                />
                              ) : (                            
                                <Image
                                  src={`data:image/png;base64,${post.contentImages[0]}`}
                                  alt={post.title}
                                  preview
                                  className="card-image"
                                  pt={{
                                    image: { 
                                      className: 'w-100 h-100', 
                                      style: { 
                                        objectFit: 'contain', 
                                        backgroundColor: '#f7f7f7',
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        margin: '0 auto'
                                      } 
                                    },
                                    indicator: { 
                                      className: 'custom-indicator',
                                      icon: <img src="/icons/mini-chef-hat.svg" alt="Chef icon" className="chef-icon" />
                                    }
                                  }}
                                />
                              )
                            ) : (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: '#f7f7f7'
                                }}
                              >
                                <img 
                                  src="/icons/chef-hat.svg" 
                                  alt="Chef hat" 
                                  style={{ width: '40%', opacity: 0.4 }}
                                />
                              </Box>
                            )}
                            <Chip
                              label={post.username}
                              size="medium"
                              avatar={<Avatar sx={{ bgcolor: '#F16A2D' }}>{post.username[0].toUpperCase()}</Avatar>}
                              onClick={() => handleChefProfile(post.username)}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                              }}
                            />
                          </CardMedia>
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography 
                              variant="h6" 
                              gutterBottom 
                              component="div"
                              sx={{ fontWeight: 600 }}
                            >
                              {post.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              paragraph
                              sx={{ mb: 'auto', flexGrow: 1 }}
                            >
                              {post.description && post.description.length > 120
                                ? `${post.description.substring(0, 120)}...`
                                : post.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Button 
                                size="small"
                                variant="text"
                                onClick={() => handleChefProfile(post.username)}
                                sx={{ 
                                  color: '#F16A2D',
                                  fontWeight: 500,
                                  '&:hover': { bgcolor: 'rgba(241, 106, 45, 0.08)' }
                                }}
                              >
                                View Details
                              </Button>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                {new Date(post.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
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
                      {searchTerm ? 'No posts match your search' : 'No posts available yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm ? 'Try different keywords' : 'Check back soon for delicious culinary creations'}
                    </Typography>
                    {searchTerm && (
                      <Button
                        variant="outlined"
                        onClick={() => setSearchTerm('')}
                        sx={{ mt: 2, borderColor: '#F16A2D', color: '#F16A2D' }}
                      >
                        Show Random Posts
                      </Button>
                    )}
                  </Box>
                )}
              </Grid>
                {/* Pagination - Always visible when there are pages */}
              {totalPages > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page + 1} 
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton 
                    showLastButton
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
        </Box>
        
        {/* Call to Action Section */}
        <Fade in={true} timeout={1000}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 4, md: 6 },
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #F16A2D 0%, #ff8f5e 100%)',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: '-15%',
                left: '-10%',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                position: 'relative',
                zIndex: 2
              }}
            >
              Ready to Experience Culinary Excellence?
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto', 
                mb: 4, 
                fontWeight: 400,
                opacity: 0.9,
                position: 'relative',
                zIndex: 2
              }}
            >
              Join Cheffin today to connect with professional chefs and discover extraordinary dining experiences
            </Typography>
            
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: '#F16A2D',
                '&:hover': { bgcolor: '#f8f8f8' },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '30px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 2
              }}
              onClick={() => isAuthenticated() ? navigate('/chefs') : navigate('/register')}
            >
              {isAuthenticated() ? 'Browse Chefs Now' : 'Sign Up Free'}
            </Button>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Home;
