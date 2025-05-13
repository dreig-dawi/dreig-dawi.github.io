import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../Utils/Constants.ts';
import { getImgSrc } from '../Utils/Utils.tsx';
import { 
  Container, Grid, Card, CardMedia, CardContent, 
  Typography, Button, Box, CircularProgress,
  TextField, InputAdornment, Avatar, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
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
    <Container maxWidth="lg" className="home-container">
      {/* Hero Section */}
      <Box className="hero-section">
        <Typography variant="h2" gutterBottom>
          Connect with Top Chefs
        </Typography>
        <Typography variant="h5" paragraph>
          Discover amazing culinary creations and chat with professional chefs
        </Typography>
        {!isAuthenticated() && (
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' }, mt: 2 }}
          >
            Join Cheffin Today
          </Button>
        )}
      </Box>
      
      {/* Search Bar */}
      <Box sx={{ my: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for recipes, chefs, or ingredients..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Featured Chefs Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Featured Chefs
        </Typography>
        
        <Grid container spacing={3}>
          {chefs.length > 0 ? (
            chefs.map(chef => (
              <Grid item xs={12} sm={6} md={3} key={chef.id}>
                <Card className="chef-card">
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Avatar 
                        src={chef.profilePicture || '/icons/chef-hat.svg'}
                        sx={{ width: 80, height: 80, border: '3px solid white' }}
                      />
                    </CardMedia>
                  </Box>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {chef.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {chef.specialty || 'Master Chef'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleChefProfile(chef.username)}
                        sx={{ borderColor: '#F16A2D', color: '#F16A2D' }}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<MessageIcon />}
                        onClick={() => handleStartChat(chef.username)}
                        sx={{ bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
                      >
                        Chat
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No featured chefs yet
              </Typography>
            </Box>
          )}
        </Grid>
      </Box>
      
      {/* Recent Posts Feed */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Latest Culinary Creations
        </Typography>
        
        <Grid container spacing={4}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Grid item xs={12} md={6} lg={4} key={post.id}>
                <Card className="post-card">
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
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        <img 
                          src="/icons/chef-hat.svg" 
                          alt="Chef hat" 
                          style={{ width: '40%', opacity: 0.5 }}
                        />
                      </Box>
                    )}
                    <Chip
                      label={post.username}
                      size="small"
                      avatar={<Avatar>{post.username[0]}</Avatar>}
                      onClick={() => handleChefProfile(post.username)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom component="div">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {post.description && post.description.length > 120
                        ? `${post.description.substring(0, 120)}...`
                        : post.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        size="small"
                        onClick={() => handleChefProfile(post.username)}
                        sx={{ color: '#F16A2D' }}
                      >
                        View More
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No posts match your search' : 'No posts available yet'}
              </Typography>
            </Box>
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default Home;