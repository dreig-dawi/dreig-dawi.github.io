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
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { Image } from 'primereact/image';
import ImageGalleria from '../../components/ImageGalleria/ImageGalleria';
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
        <CircularProgress sx={{ color: '#F16A2D', '& circle': { strokeLinecap: 'round' } }} />
      </Box>
    );
  }
  
  if (!chefData) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4">Chef not found</Typography>
          <Button          variant="contained" 
            onClick={() => navigate('/home')}
            sx={{ 
              mt: 3, 
              background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
              '&:hover': { opacity: 0.9 },
              boxShadow: '0 4px 12px rgba(241, 106, 45, 0.2)' 
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }
    return (
      
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Container maxWidth="lg" className="chef-profile-container" >
        {/* Chef Profile Banner */}
        <Box className="profile-banner"
          sx={{
            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0
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
              zIndex: 0
            }}
          />
          <Box className="profile-header" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              src={chefData.profilePicture || '/icons/chef-hat.svg'}
              sx={{
                width: 150,
                height: 150,
                border: '4px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            />
      
            <Box className="profile-info">
              <Typography variant="h4" sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>{chefData.username}</Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {chefData.specialty}
              </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {isCurrentChef ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditDialog}
                    sx={{
                      bgcolor: 'white',
                      color: '#F16A2D',
                      '&:hover': { bgcolor: '#f8f8f8' },
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<MessageIcon />}
                    onClick={handleStartChat}
                    sx={{
                      bgcolor: 'white',
                      color: '#F16A2D',
                      '&:hover': { bgcolor: '#f8f8f8' },
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Chat with Chef
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
          {/* Chef Bio */}
        <Box className="chef-bio" sx={{
          my: 4,
          bgcolor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(241, 106, 45, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{
            color: '#F16A2D',
            position: 'relative',
            display: 'inline-block',
            pb: 1,
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '40px',
              height: '3px',
              backgroundColor: '#F16A2D'
            }
          }}>
            About
          </Typography>
          <Typography variant="body1">{chefData.bio}</Typography>
          {chefData.experience && (
            <Typography variant="body2" sx={{ mt: 1, color: '#666', display: 'flex', alignItems: 'center' }}>
              <LocalDiningIcon sx={{ mr: 1, fontSize: 18, color: '#F16A2D' }}/>
              {chefData.experience} years of culinary experience
            </Typography>
          )}
        </Box>
      
        {/* Content Tabs */}      <Box sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(241, 106, 45, 0.2) 0%, rgba(241, 106, 45, 0.5) 50%, rgba(241, 106, 45, 0.2) 100%)'
            }
          }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#F16A2D',
                height: '3px',
                borderRadius: '3px 3px 0 0'
              }
            }}
          ><Tab label="Recipes" sx={{
              color: '#666',
              '&.Mui-selected': {
                color: '#F16A2D',
                fontWeight: 'medium'
              }
            }} />
            <Tab label="Gallery" sx={{
              color: '#666',
              '&.Mui-selected': {
                color: '#F16A2D',
                fontWeight: 'medium'
              }
            }} />
          </Tabs>
        </Box>
          {/* Add New Post Button (for chef only) */}
        {isCurrentChef && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
              sx={{
                backgroundImage: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                '&:hover': { opacity: 0.9 },
                boxShadow: '0 4px 12px rgba(241, 106, 45, 0.25)'
              }}
            >
              Add New Post
            </Button>
          </Box>
        )}
      
        {/* Content Display */}        <Box role="tabpanel" hidden={activeTab !== 0}>
          {activeTab === 0 && (
            <Grid container spacing={3} sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', justifyContent: 'center' }}>
              {posts.length > 0 ? (
                posts.map(post => (                <Grid item xs={12} sm={6} md={6} key={post.id}>
                    <Card className="post-card" sx={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                      '&:hover': {
                        boxShadow: '0 12px 28px rgba(241, 106, 45, 0.15)',
                        transform: 'translateY(-5px)'
                      }
                    }}>                      <CardMedia
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >{post.contentImages && post.contentImages.length > 0 ? (                        post.contentImages.length > 1 ? (
                            <ImageGalleria
                              images={post.contentImages}
                              title={post.title}
                            />) : (
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
                                    margin: '0 auto',
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
                      </CardMedia>
                      <CardContent>                      <Typography variant="h6" gutterBottom sx={{
                          color: '#F16A2D',
                          fontWeight: 500
                        }}>{post.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.description.length > 120 ?
                            `${post.description.substring(0, 120)}...` : post.description}
                        </Typography>
      
                        {isCurrentChef && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>                          <IconButton
                              onClick={() => handleDeletePost(post.id)}
                              sx={{
                                color: 'white',
                                background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                                '&:hover': { opacity: 0.9 },
                                boxShadow: '0 4px 8px rgba(241, 106, 45, 0.2)'
                              }}
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
                <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>              <Typography variant="h6" sx={{
                  color: '#666',
                  p: 4,
                  bgcolor: 'rgba(241, 106, 45, 0.05)',
                  borderRadius: '12px'
                }}>
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
              {posts.filter(post => post.contentImages && post.contentImages.length > 0).map(post => (              <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 28px rgba(241, 106, 45, 0.15)',
                      transform: 'translateY(-5px)'
                    },
                    position: 'relative'
                  }}>
                    <Typography variant="h6" sx={{ p: 2, pb: 1, color: '#F16A2D', fontWeight: 500 }}>{post.title}</Typography>
                    <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                      <ImageGalleria
                        images={post.contentImages}
                        title={post.title}
                      />
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {post.contentImages.length} {post.contentImages.length === 1 ? 'image' : 'images'} in this recipe
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
      
              {posts.length === 0 && (
                <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>              <Typography variant="h6" sx={{
                  color: '#666',
                  p: 4,
                  bgcolor: 'rgba(241, 106, 45, 0.05)',
                  borderRadius: '12px'
                }}>
                  No images in gallery
                </Typography>
                </Box>
              )}
            </Grid>
          )}
        </Box>
      
        {/* Upload Content Dialog */}
        <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>Create New Post</DialogTitle>
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
      
              <Box sx={{ mt: 3, mb: 2 }}>              <Button
                  variant="contained"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                    color: 'white',
                    '&:hover': { opacity: 0.9 },
                    boxShadow: '0 4px 12px rgba(241, 106, 45, 0.2)'
                  }}
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
                      <Box sx={{ position: 'relative' }}>                      <img
                          src={preview}
                          alt={`Preview ${index}`}
                          style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#f7f7f7' }}
                        />                      <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                            color: 'white',
                            '&:hover': { opacity: 0.9 }
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
            <Button onClick={handleCloseUploadDialog} sx={{ color: '#666' }}>Cancel</Button>          <Button
              onClick={handleSubmitPost}
              sx={{
                background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                color: 'white',
                '&:hover': { opacity: 0.9 },
                '&.Mui-disabled': {
                  background: '#f1f1f1',
                  color: '#999'
                }
              }}
              disabled={!uploadData.title || !uploadData.description || uploadData.images.length === 0}
            >
              Create Post
            </Button>
          </DialogActions>
        </Dialog>
      
        {/* Edit Profile Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>Edit Profile</DialogTitle>
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
            <Button onClick={handleCloseEditDialog} sx={{ color: '#666' }}>Cancel</Button>          <Button
              onClick={handleUpdateProfile}
              sx={{
                background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                color: 'white',
                '&:hover': { opacity: 0.9 }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ChefProfile;