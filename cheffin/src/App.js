import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, Container, Grid, Typography, Box, 
  Card, CardContent, CardMedia, IconButton 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DiningIcon from '@mui/icons-material/Dining';
import MessageIcon from '@mui/icons-material/Message';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import './App.css';

function App() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DiningIcon fontSize="large" />,
      title: "Discover Chefs",
      description: "Connect with professional chefs from around the world and discover their unique culinary creations."
    },
    {
      icon: <MessageIcon fontSize="large" />,
      title: "Real-time Chat",
      description: "Ask questions, get cooking tips, and learn directly from chefs through our real-time messaging system."
    },
    {
      icon: <PhotoCameraIcon fontSize="large" />,
      title: "Visual Inspiration",
      description: "Browse beautiful food photography and get inspired for your next culinary adventure."
    }
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Professional Chef",
      text: "Cheffin has given me a platform to share my passion and connect with food enthusiasts worldwide. It's revolutionized how I interact with my audience.",
      image: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      name: "David Kim",
      role: "Cooking Enthusiast",
      text: "Being able to chat directly with professional chefs has improved my cooking skills dramatically. I love the personalized advice I get!",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" className="hero-title" gutterBottom>
                Where Food Lovers Meet <span className="highlight">Master Chefs</span>
              </Typography>
              <Typography variant="h6" className="hero-subtitle" paragraph>
                Discover culinary masterpieces, connect with professional chefs, and elevate your cooking journey.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  className="cta-button"
                  endIcon={<ArrowForwardIcon />}
                >
                  Join Cheffin
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/home')}
                  className="secondary-button"
                >
                  Explore
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} className="hero-image-container">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="Chef cooking" 
                className="hero-image"
              />
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom className="section-title">
            Why Choose Cheffin
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 , justifyContent: 'center'}}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className="feature-card">
                  <CardContent>
                    <Box className="feature-icon">
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom className="feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom className="section-title">
            What Our Users Say
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card className="testimonial-card">
                  <CardContent>
                    <Typography variant="body1" paragraph className="testimonial-text">
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 50, height: 50, borderRadius: '50%', mr: 2 }}
                        image={testimonial.image}
                        alt={testimonial.name}
                      />
                      <Box>
                        <Typography variant="subtitle1" component="h4" className="testimonial-name">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="testimonial-role">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Call-to-Action Section */}
      <div className="cta-section">
        <Container maxWidth="md">
          <Box textAlign="center" className="cta-container">
            <Typography variant="h3" component="h2" gutterBottom className="cta-title">
              Ready to Start Your Culinary Journey?
            </Typography>
            <Typography variant="h6" paragraph className="cta-subtitle">
              Join thousands of food enthusiasts and professional chefs on Cheffin today.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              className="cta-button large"
            >
              Create Your Account
            </Button>
          </Box>
        </Container>
      </div>

      {/* Footer */}
      <footer className="footer">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box className="footer-brand">
                <Typography variant="h6" gutterBottom className="footer-title">
                  Cheffin
                </Typography>
                <Typography variant="body2" className="footer-description">
                  Connecting food lovers with master chefs from around the world.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="footer-title">
                Quick Links
              </Typography>
              <ul className="footer-links">
                <li><Button onClick={() => navigate('/home')}>Home</Button></li>
                <li><Button onClick={() => navigate('/register')}>Register</Button></li>
                <li><Button onClick={() => navigate('/login')}>Login</Button></li>
              </ul>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="footer-title">
                Connect With Us
              </Typography>
              <Box className="social-icons">
                <IconButton aria-label="facebook" className="social-icon">
                  <img src="/icons/facebook.svg" alt="Facebook" width="24" height="24" />
                </IconButton>
                <IconButton aria-label="twitter" className="social-icon">
                  <img src="/icons/twitter.svg" alt="Twitter" width="24" height="24" />
                </IconButton>
                <IconButton aria-label="instagram" className="social-icon">
                  <img src="/icons/instagram.svg" alt="Instagram" width="24" height="24" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          <Box className="copyright" sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Cheffin. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </footer>
    </div>
  );
}

export default App;
