import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants.ts';
import { 
  Container, Grid, Box, Typography, Avatar, 
  Button, Tabs, Tab, Card, CardMedia, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import './ChefProfile.css';

function ChefProfile() {
  const { username } = useParams();
  const { currentUser, isAuthenticated, isChef, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [chefData, setChefData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    images: []
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [editProfileData, setEditProfileData] = useState({
    bio: '',
    specialty: '',
    experience: ''
  });
  const [isCurrentChef, setIsCurrentChef] = useState(false);
  
  useEffect(() => {
    // Determine if the profile being viewed belongs to the current user
    if (isAuthenticated() && currentUser) {
      setIsCurrentChef(currentUser.username === username && isChef());
    }
    
    // Fetch chef profile data
    const fetchChefData = async () => {
      try {
        const response = await axios.get(`${endpoint}/users/chef/${username}`);
        setChefData(response.data);
        
        // Set edit form data for the current chef
        if (isCurrentChef) {
          setEditProfileData({
            bio: response.data.bio || '',
            specialty: response.data.specialty || '',
            experience: response.data.experience || ''
          });
        }
        
        // Fetch chef's posts
        const postsResponse = await axios.get(`${endpoint}/post/user/${username}`);
        setPosts(postsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chef data:', error);
        setLoading(false);
      }
    };
    
    fetchChefData();
  }, [username, currentUser, isAuthenticated, isChef, isCurrentChef]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };
  
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    // Reset form
    setUploadData({
      title: '',
      description: '',
      images: []
    });
    setImagePreview([]);
  };
  
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      setUploadData(prevState => ({
        ...prevState,
        images: [...prevState.images, ...files]
      }));
      
      // Generate previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(prevPreviews => [...prevPreviews, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    setUploadData(prevState => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index)
    }));
    
    setImagePreview(prevPreviews => 
      prevPreviews.filter((_, i) => i !== index)
    );
  };
    const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!uploadData.title || !uploadData.description || uploadData.images.length === 0) {
      alert('Please fill all fields and upload at least one image');
      return;
    }
    
    try {
      // Convert image files to base64 strings
      const imagePromises = uploadData.images.map(imageFile => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Get the base64 string (remove the data:image/xxx;base64, prefix)
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      // Create JSON payload
      const postData = {
        title: uploadData.title,
        description: uploadData.description,
        contentImages: base64Images
      };
      
      const token = localStorage.getItem('authToken');
      
      console.log("Sending post data with", base64Images.length, "images");
      
      const response = await axios.post(`${endpoint}/post`, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Add new post to the posts state
      setPosts(prevPosts => [response.data, ...prevPosts]);
      
      // Close dialog and reset form
      handleCloseUploadDialog();
    } catch (error) {
      console.error('Error creating post:', error);
      // Show more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to create post: ${error.response.data.message || 'Unknown server error'}`);
      } else {
        alert('Failed to create post. Please try again.');
      }
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        bio: editProfileData.bio,
        specialty: editProfileData.specialty,
        experience: editProfileData.experience
      });
      
      // Update local chef data
      setChefData(prevData => ({
        ...prevData,
        bio: editProfileData.bio,
        specialty: editProfileData.specialty,
        experience: editProfileData.experience
      }));
      
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('authToken');
        
        await axios.delete(`${endpoint}/post/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove deleted post from state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  const handleStartChat = () => {
    navigate(`/chat/${username}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#F16A2D' }} />
      </Box>
    );
  }
  
  if (!chefData) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4">Chef not found</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/home')}
            sx={{ mt: 3, bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="chef-profile-container">
      {/* Chef Profile Banner */}
      <Box className="profile-banner">
        <Box className="profile-header">
          <Avatar 
            src={chefData.profilePicture || '/icons/chef-hat.svg'} 
            sx={{ width: 150, height: 150, border: '4px solid white' }}
          />
          
          <Box className="profile-info">
            <Typography variant="h4">{chefData.username}</Typography>
            <Typography variant="subtitle1" sx={{ color: '#666' }}>
              {chefData.specialty}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {isCurrentChef ? (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditDialog}
                  sx={{ borderColor: '#F16A2D', color: '#F16A2D' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  startIcon={<MessageIcon />}
                  onClick={handleStartChat}
                  sx={{ bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
                >
                  Chat with Chef
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Chef Bio */}
      <Box className="chef-bio" sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom>About</Typography>
        <Typography variant="body1">{chefData.bio}</Typography>
        {chefData.experience && (
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            {chefData.experience} years of culinary experience
          </Typography>
        )}
      </Box>
      
      {/* Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-indicator': { backgroundColor: '#F16A2D' } }}
        >
          <Tab label="Recipes" />
          <Tab label="Gallery" />
        </Tabs>
      </Box>
      
      {/* Add New Post Button (for chef only) */}
      {isCurrentChef && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenUploadDialog}
            sx={{ bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
          >
            Add New Post
          </Button>
        </Box>
      )}
      
      {/* Content Display */}
      <Box role="tabpanel" hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {posts.length > 0 ? (
              posts.map(post => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card className="post-card">                    <CardMedia
                      component="img"
                      height="200"
                      image={post.contentImages && post.contentImages.length > 0 ? 
                        `data:image/png;base64,${post.contentImages[0]}` : "/icons/chef-hat.svg"}
                      alt={post.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{post.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.description.length > 120 ? 
                          `${post.description.substring(0, 120)}...` : post.description}
                      </Typography>
                      
                      {isCurrentChef && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <IconButton 
                            onClick={() => handleDeletePost(post.id)}
                            sx={{ color: '#F16A2D' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No recipes posted yet
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <Grid container spacing={2}>
            {posts.flatMap(post => 
              post.contentImages ? post.contentImages.map((image, index) => (                <Grid item xs={6} sm={4} md={3} key={`${post.id}-${index}`}>
                  <img 
                    src={`data:image/png;base64,${image}`} 
                    alt={`Content by ${chefData.username}`}
                    className="gallery-image"
                  />
                </Grid>
              )) : []
            )}
            
            {posts.length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No images in gallery
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>
      
      {/* Upload Content Dialog */}
      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#F16A2D', color: 'white' }}>Create New Post</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={uploadData.title}
              onChange={handleUploadChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={uploadData.description}
              onChange={handleUploadChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                sx={{ borderColor: '#F16A2D', color: '#F16A2D' }}
              >
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
            
            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {imagePreview.map((preview, index) => (
                  <Grid item xs={4} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <IconButton
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          right: -8, 
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPost} 
            sx={{ color: '#F16A2D' }}
            disabled={!uploadData.title || !uploadData.description || uploadData.images.length === 0}
          >
            Create Post
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#F16A2D', color: 'white' }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateProfile} 
            sx={{ color: '#F16A2D' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ChefProfile;