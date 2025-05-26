import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Avatar,
  Typography,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { endpoint } from '../../Utils/Constants';
import axios from 'axios';
import './profile-picture-upload.css';

function EditProfileDialog({ open, onClose, userData, onProfileUpdate }) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [editProfileData, setEditProfileData] = useState({
    specialty: userData?.specialty || '',
    bio: userData?.bio || '',
    experience: userData?.experience || '',
    profilePicture: userData?.profilePicture || null
  });

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProfileImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Maximum size is 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Get the full data URL with prefix (data:image/png;base64,...)
        const dataUrl = reader.result;
        setProfileImagePreview(dataUrl);
        setEditProfileData(prevState => ({
          ...prevState,
          profilePicture: dataUrl // Store the full data URL
        }));
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {      // Create update data including the base64 image data
      let profilePicture = editProfileData.profilePicture;
      
      // If it's a data URL, extract just the base64 part
      if (profilePicture?.startsWith('data:')) {
        profilePicture = profilePicture.split(',')[1];
      }

      const updateData = {
        ...(userData.isChef && {
          specialty: editProfileData.specialty || '',
          bio: editProfileData.bio || '',
          experience: editProfileData.experience ? parseInt(editProfileData.experience, 10) : null
        }),
        // Send just the base64 data for profile picture
        profilePicture: profilePicture
      };

      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${endpoint}/users/profile`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        onProfileUpdate(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>Edit Profile</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {/* Profile Picture Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 1 }}>
            <Box className="profile-picture-upload">
              <Avatar                src={profileImagePreview || userData?.profilePicture || '/icons/orange-chef.png'}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  border: '3px solid #F16A2D',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  backgroundColor: 'white',
                }}
              />
              <Box 
                component="label" 
                className="profile-picture-overlay"
                htmlFor="profile-picture-upload"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <EditIcon sx={{ color: 'white' }} />
              </Box>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileImageUpload}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#666', mt: 1 }}>
              Click on the image to upload a new profile picture
            </Typography>
          </Box>
          
          {/* Chef-specific fields - only shown to chef users */}
          {userData?.isChef && (
            <>
              <TextField
                fullWidth
                label="Culinary Specialty"
                name="specialty"
                value={editProfileData.specialty}
                onChange={handleEditProfileChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={editProfileData.bio}
                onChange={handleEditProfileChange}
                margin="normal"
                multiline
                rows={4}
                placeholder="Share your culinary journey, specialties, and inspiration..."
                helperText="Your bio will be featured prominently in the About section of your profile"
              />
              <TextField
                fullWidth
                label="Experience (years)"
                name="experience"
                type="number"
                value={editProfileData.experience}
                onChange={handleEditProfileChange}
                margin="normal"
                inputProps={{ min: 0 }}
                helperText="Your years of culinary experience will be displayed in your profile header"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isUpdatingProfile}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateProfile}
          disabled={isUpdatingProfile}
          sx={{
            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
            color: 'white',
            '&:hover': { opacity: 0.9 }
          }}
        >
          {isUpdatingProfile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> 
              Saving...
            </Box>
          ) : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProfileDialog;
