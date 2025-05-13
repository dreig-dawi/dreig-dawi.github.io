import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  TextField, Button, Typography, Container, Box, Alert, Paper, 
  Tabs, Tab, FormControlLabel, Switch, Grid, Avatar, IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './Register.css';

function Register() {
  const [activeTab, setActiveTab] = useState(0);
  const [isChef, setIsChef] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Form state for regular user
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Additional chef form data
  const [chefFormData, setChefFormData] = useState({
    specialty: '',
    bio: '',
    experience: ''
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setIsChef(newValue === 1);
  };
  
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleChefChange = (e) => {
    const { name, value } = e.target;
    setChefFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    // Check if passwords match
    if (userFormData.password !== userFormData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userFormData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    
    // Password strength
    if (userFormData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    
    // If chef, validate chef fields
    if (isChef) {
      if (!chefFormData.specialty || !chefFormData.bio) {
        setError("Please fill all required chef fields");
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the registration data
      const userData = {
        ...userFormData,
        ...(isChef && chefFormData),
        profilePicture: profilePreview
      };
      
      delete userData.confirmPassword; // Remove this field before sending
      
      await register(userData, isChef);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} className="register-container">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4
          }}
        >
          <img 
            src="/icons/orange-chef.png" 
            alt="Chef Logo" 
            className="register-logo" 
            style={{ width: '100px', marginBottom: '20px' }}
          />
          
          <Typography component="h1" variant="h5" gutterBottom>
            Create a Cheffin Account
          </Typography>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Regular User" />
            <Tab label="Chef" />
          </Tabs>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {/* User information - common for both tabs */}
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={profilePreview} 
                    sx={{ width: 100, height: 100 }}
                  />
                  <input
                    accept="image/*"
                    id="profile-picture-upload"
                    type="file"
                    hidden
                    onChange={handleProfilePicture}
                  />
                  <label htmlFor="profile-picture-upload">
                    <IconButton 
                      component="span"
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        backgroundColor: '#F16A2D',
                        color: 'white',
                        '&:hover': { bgcolor: '#d45c26' }
                      }}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                  </label>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={userFormData.username}
                  onChange={handleUserChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={userFormData.email}
                  onChange={handleUserChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={userFormData.password}
                  onChange={handleUserChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={userFormData.confirmPassword}
                  onChange={handleUserChange}
                />
              </Grid>
            </Grid>
            
            {/* Chef specific fields */}
            {isChef && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chef Profile
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="specialty"
                      label="Culinary Specialty"
                      name="specialty"
                      placeholder="e.g., Italian Cuisine, Pastry, Vegan..."
                      value={chefFormData.specialty}
                      onChange={handleChefChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="bio"
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      placeholder="Tell us about yourself and your culinary journey..."
                      value={chefFormData.bio}
                      onChange={handleChefChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="experience"
                      label="Experience (years)"
                      name="experience"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={chefFormData.experience}
                      onChange={handleChefChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#F16A2D', textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;