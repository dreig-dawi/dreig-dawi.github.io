import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants.ts';
import { 
  Container, Grid, Card, CardMedia, CardContent, 
  Typography, Button, Box, CircularProgress,
  TextField, InputAdornment, Avatar, Chip,
  Paper, Divider, IconButton, Fade, Zoom
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StarIcon from '@mui/icons-material/Star';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { Image } from 'primereact/image';
import './Home.css';

function Home() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch posts and chefs
    fetchData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      const postResponse = await axios.get(`${endpoint}/post`);
      setPosts(postResponse.data);
      
      // Fetch featured chefs
      const chefsResponse = await axios.get(`${endpoint}/users/chefs/featured`);
      setChefs(chefsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  
  if (loading) {
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
          
          <Grid container spacing={3}>
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
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Discover the most recent delicious masterpieces from our chefs
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={4}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <Grid item xs={12} md={6} lg={4} key={post.id}>
                  <Fade in={true} timeout={1000} style={{ transitionDelay: `${150 * index}ms` }}>
                    <Card 
                      className="post-card" 
                      sx={{ 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{ 
                          position: 'relative',
                          height: 0,
                          paddingTop: '56.25%' // 16:9 aspect ratio
                        }}
                      >
                        {post.contentImages && post.contentImages.length > 0 ? (
                          <Image
                            src={post.contentImages[0]} 
                            alt={post.title}
                            preview
                            className="card-image"
                            pt={{
                              image: { className: 'w-100 h-100' },
                              indicator: { 
                                className: 'custom-indicator',
                                icon: <img src="/icons/mini-chef-hat.svg" alt="Chef icon" className="chef-icon" />
                              }
                            }}
                          />
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
              </Box>
            )}
          </Grid>
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