import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Avatar,
  Menu, MenuItem, Box, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Divider, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditProfileDialog from '../Profile/EditProfileDialog';
import './Navbar.css';

function Navbar() {
  const { currentUser, isAuthenticated, logout, isChef } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
    setMobileMenuOpen(false);
  };
  
  const handleNavigation = (path) => {
    if (path === `/chef/${currentUser.username}` && !isChef()) {
      // For non-chef users, open EditProfileDialog instead
      setEditProfileOpen(true);
    } else {
      navigate(path);
    }
    handleMenuClose();
    setMobileMenuOpen(false);
  };

  const handleProfileUpdate = (updatedData) => {
    // Update currentUser data after profile update
    if (currentUser) {
      Object.assign(currentUser, updatedData);
    }
  };
  
  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {isAuthenticated() && (
        <div>
          <MenuItem onClick={() => handleNavigation(`/chef/${currentUser.username}`)}>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/chat')}>
            Messages
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </div>
      )}
    </Menu>
  );
  
  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
      >
        {isAuthenticated() ? (
          <Box className="drawer-header">
            <Avatar 
              src={currentUser?.profilePicture ? `data:image/jpeg;base64,${currentUser.profilePicture}` : undefined} 
              alt={currentUser?.username}
              sx={{ width: 60, height: 60, mb: 1 }}
            >
              {currentUser?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">
              {currentUser?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isChef() ? 'Chef' : 'User'}
            </Typography>
          </Box>
        ) : (
          <Box className="drawer-header">
            <img 
              src="/icons/chef-hat.svg" 
              alt="Cheffin Logo" 
              style={{ width: 60, height: 60, marginBottom: 8 }}
            />
            <Typography variant="h6">
              Cheffin
            </Typography>
          </Box>
        )}
        
        <Divider />
        
        <List>
          <ListItem button onClick={() => handleNavigation('/home')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          
          {isAuthenticated() ? (
            <>
              <ListItem button onClick={() => handleNavigation('/chat')}>
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary="Messages" />
              </ListItem>
              
              <ListItem button onClick={() => handleNavigation(`/chef/${currentUser.username}`)}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItem>
              
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleNavigation('/login')}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
              
              <ListItem button onClick={() => handleNavigation('/register')}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
  
  return (
    <div className="navbar">
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/home"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/icons/chef-hat.svg" 
              alt="Cheffin Logo" 
              style={{ width: 30, height: 30, marginRight: 10 }}
            />
            Cheffin
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/home"
                sx={{ mx: 1 }}
              >
                Home
              </Button>
              
              {isAuthenticated() ? (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/chat"
                    sx={{ mx: 1 }}
                  >
                    Messages
                  </Button>
                  
                  <IconButton
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                    sx={{ ml: 1 }}
                  >                    <Avatar 
                      src={currentUser?.profilePicture ? `data:image/jpeg;base64,${currentUser.profilePicture}` : undefined}
                      alt={currentUser?.username}
                      sx={{ width: 32, height: 32 }}
                    >
                      {currentUser?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                    sx={{ mx: 1 }}
                  >
                    Login
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/register"
                    sx={{ 
                      ml: 1, 
                      bgcolor: '#F16A2D', 
                      '&:hover': { bgcolor: '#d45c26' } 
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {renderMenu}
      {mobileMenu}
      
      <EditProfileDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        userData={currentUser}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default Navbar;