import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants';
import { 
  Container, Grid, Box, Typography, Avatar, 
  Button, Card, CardMedia, CardContent,
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
import './experience-badge.css';
import './chef-bio-pattern.css';
import './profile-picture-upload.css';

function ChefProfile() {
  const { username } = useParams();
  const { currentUser, isAuthenticated, isChef, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [chefData, setChefData] = useState(null);
  const [posts, setPosts] = useState([]);  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    images: []
  });
  const [imagePreview, setImagePreview] = useState([]);  const [editProfileData, setEditProfileData] = useState({
    bio: '',
    specialty: '',
    experience: '',
    profilePicture: ''
  });  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isCurrentChef, setIsCurrentChef] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  useEffect(() => {
    // Determine if the profile being viewed belongs to the current user
    if (isAuthenticated() && currentUser) {
      setIsCurrentChef(currentUser.username === username && isChef());
      setIsCurrentUser(currentUser.username === username);
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
            experience: response.data.experience || '',
            profilePicture: response.data.profilePicture || ''
          });
          
          // Initialize profile image preview if exists
          if (response.data.profilePicture) {
            setProfileImagePreview(response.data.profilePicture);
          }
        }
        
        // Fetch chef's posts
        const postsResponse = await axios.get(`${endpoint}/post/user/${username}`);
        setPosts(postsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chef data:', error);
        setLoading(false);
      }    };
    
    fetchChefData();
  }, [username, currentUser, isAuthenticated, isChef, isCurrentChef, isCurrentUser]);
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
    // Reset the profile image preview if the user cancels without saving
    setProfileImagePreview(null);
    // Reset form to current values
    if (chefData) {
      setEditProfileData({
        bio: chefData.bio || '',
        specialty: chefData.specialty || '',
        experience: chefData.experience || '',
        profilePicture: chefData.profilePicture || ''
      });
    }
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
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Store the file reference
      // (similar to setProfilePicture(file) in Register.js)
      
      // Convert image to data URL for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        // Get the full data URL including prefix (data:image/png;base64,)
        const fullDataUrl = reader.result;
        
        // Set preview with full data URL
        setProfileImagePreview(fullDataUrl);
        
        // Update edit profile data with the full data URL string
        // This matches Register.js and database expectations
        setEditProfileData(prevState => ({
          ...prevState,
          profilePicture: fullDataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };
    const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Check if adding these files would exceed the 9-file limit
      const totalFileCount = uploadData.images.length + files.length;
      
      if (totalFileCount > 9) {
        alert(`You can only upload a maximum of 9 images. You currently have ${uploadData.images.length} images selected.`);
        // Only add files up to the limit
        const remainingSlots = Math.max(0, 9 - uploadData.images.length);
        const filesToAdd = files.slice(0, remainingSlots);
        
        if (filesToAdd.length > 0) {
          setUploadData(prevState => ({
            ...prevState,
            images: [...prevState.images, ...filesToAdd]
          }));
          
          // Generate previews only for files we're adding
          filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(prevPreviews => [...prevPreviews, reader.result]);
            };
            reader.readAsDataURL(file);
          });
        }
      } else {
        // No limit problems, add all files
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
  };    const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    setIsUpdatingProfile(true); // Start loading
    
    try {
      // Create update data based on user type
      const updateData = isChef() ? {
        bio: editProfileData.bio,
        specialty: editProfileData.specialty,
        experience: editProfileData.experience,
        profilePicture: editProfileData.profilePicture
      } : {
        profilePicture: editProfileData.profilePicture
      };
      
      await updateProfile(updateData);
      
      // Update local chef data based on user type
      setChefData(prevData => ({
        ...prevData,
        ...(isChef() ? {
          bio: editProfileData.bio,
          specialty: editProfileData.specialty,
          experience: editProfileData.experience,
        } : {}),
        profilePicture: editProfileData.profilePicture
      }));
      
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false); // End loading
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
    // Prevent chatting with yourself
    if (currentUser && username === currentUser.username) {
      // Navigate to general chat page instead
      navigate('/chat');
      return;
    }
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
          />          <Box className="profile-header" sx={{ position: 'relative', zIndex: 1 }}>
            {isCurrentUser ? (
              <Box className="profile-picture-upload">
                <Avatar
                  src={chefData.profilePicture || '/icons/orange-chef.png'}
                  sx={{
                    width: 150,
                    height: 150,
                    border: '4px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    backgroundColor: 'white',
                  }}
                />
                <Box 
                  component="label" 
                  className="profile-picture-overlay"
                  htmlFor="banner-profile-picture-upload"
                >
                  <EditIcon className="profile-picture-icon" />
                </Box>
                <input
                  id="banner-profile-picture-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfileImageUpload}
                />
              </Box>
            ) : (
              <Avatar
                src={chefData.profilePicture || '/icons/orange-chef.png'}
                sx={{
                  width: 150,
                  height: 150,
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  backgroundColor: 'white',
                }}
              />            )}
      
            <Box className="profile-info">
              <Typography variant="h4" sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>{chefData.username}</Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                {chefData.specialty}
              </Typography>              
              {chefData.experience && (
                <Typography variant="subtitle1" className="experience-badge" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: '500',
                  mb: 1.5,
                  display: 'inline-flex'
                }}>
                  <LocalDiningIcon />
                  {chefData.experience} years of culinary experience
                </Typography>
              )}                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {isCurrentUser ? (
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
                  </Button>                ) : currentUser && username !== currentUser.username ? (
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
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>        {/* Chef Bio - Only displayed for chef profiles */}        
        {isChef() && (
          <Box className="chef-bio" sx={{
            my: 4,
            bgcolor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(241, 106, 45, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="chef-bio-pattern"></div>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{
                color: '#F16A2D',
                position: 'relative',
                display: 'inline-block',
                pb: 1,
                mb: 0,
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
                About {chefData.username}
              </Typography>
            </Box>
            {chefData.bio ? (
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7, 
                color: '#444',
                position: 'relative',
                zIndex: 1
              }}>{chefData.bio}</Typography>
            ) : (
              <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                This chef hasn't added a bio yet.
              </Typography>
            )}
          </Box>
        )}        {/* Content Tabs - Only displayed for chef profiles */}      
        {isChef() && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalDiningIcon sx={{ color: '#F16A2D', mr: 1, fontSize: 22 }} />
              <Typography variant="h6" sx={{ 
                color: '#444', 
                fontWeight: 500,
                borderBottom: '3px solid #F16A2D',
                paddingBottom: '8px',
                paddingRight: '10px',
                paddingLeft: '2px'
              }}>
                Recipes
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ 
              color: '#777', 
              fontStyle: 'italic',
              mr: 2 
            }}>
              {posts.length} {posts.length === 1 ? 'recipe' : 'recipes'} shared
            </Typography>
          </Box>
        )}
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
        )}        {/* Content Display - Only shown for chef profiles */}
        {isChef() && (
          <Box role="tabpanel">
            <Grid container spacing={3} sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', justifyContent: 'center' }}>{posts.length > 0 ? (
              posts.map(post => (
                <Grid item xs={12} sm={6} md={6} key={post.id}>
                  <Card className="post-card" sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                    '&:hover': {
                      boxShadow: '0 12px 28px rgba(241, 106, 45, 0.15)',
                      transform: 'translateY(-5px)'
                    }
                  }}>
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >{post.contentImages && post.contentImages.length > 0 ? (
                        post.contentImages.length > 1 ? (
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
                          <img                            src="/icons/orange-chef.png"
                            alt="Chef"
                            style={{ width: '40%', opacity: 0.4 }}
                          />
                        </Box>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{
                        color: '#F16A2D',
                        fontWeight: 500
                      }}>{post.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.description.length > 120 ?
                          `${post.description.substring(0, 120)}...` : post.description}
                      </Typography>
    
                      {isCurrentChef && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <IconButton
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
            ) : (              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 5,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,248,248,0.95) 100%)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(241, 106, 45, 0.3)',
                  padding: '3rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}>
                  <Box 
                    sx={{
                      width: '60px',
                      height: '60px',
                      backgroundImage: 'url(/icons/chef-hat.svg)',
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      opacity: 0.6,
                      mb: 2,
                      mx: 'auto'
                    }} 
                  />
                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                    No recipes shared yet
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#888', maxWidth: '500px', mx: 'auto' }}>
                    {isCurrentChef 
                      ? "You haven't shared any recipes yet. Add your first recipe to showcase your culinary skills!"
                      : `${chefData.username} hasn't shared any recipes yet. Check back later for delicious updates!`
                    }
                  </Typography>
                  
                  {isCurrentChef && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenUploadDialog}
                      sx={{
                        backgroundImage: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                        '&:hover': { opacity: 0.9 },
                        boxShadow: '0 4px 12px rgba(241, 106, 45, 0.25)',
                        mt: 3
                      }}
                    >
                      Add Your First Recipe
                    </Button>
                  )}
                </Box>
              </Grid>
            )}          </Grid>
        </Box>
        )}
      
        {/* Upload Content Dialog */}
        <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const droppedFiles = Array.from(e.dataTransfer.files).filter(
                        file => file.type.startsWith('image/')
                      );
                      
                      if (droppedFiles.length > 0) {
                        // Handle files the same way as file input
                        setUploadData(prevState => ({
                          ...prevState,
                          images: [...prevState.images, ...droppedFiles]
                        }));
                        
                        // Generate previews for dropped files
                        droppedFiles.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(prevPreviews => [...prevPreviews, reader.result]);
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }
                  }}>
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>Create New Post</DialogTitle>          <DialogContent>
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
      
              <Box 
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >                <Box
                  sx={{
                    border: '2px dashed #F16A2D',
                    borderRadius: '8px',
                    padding: '20px',
                    width: '100%',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: uploadData.images.length >= 9 ? 'rgba(200, 200, 200, 0.2)' : 'rgba(241, 106, 45, 0.05)',
                    cursor: uploadData.images.length >= 9 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: uploadData.images.length >= 9 ? 'rgba(200, 200, 200, 0.2)' : 'rgba(241, 106, 45, 0.1)',
                    },
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden'
                  }}                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Only show drag effect if we haven't reached the limit
                    if (uploadData.images.length < 9) {
                      e.currentTarget.style.backgroundColor = 'rgba(241, 106, 45, 0.2)';
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = 'rgba(241, 106, 45, 0.05)';
                  }}                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = 'rgba(241, 106, 45, 0.05)';
                    
                    // If we've already hit the limit, don't process any more files
                    if (uploadData.images.length >= 9) {
                      alert('You have already selected the maximum of 9 images.');
                      return;
                    }
                    
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const droppedFiles = Array.from(e.dataTransfer.files).filter(
                        file => file.type.startsWith('image/')
                      );
                      
                      if (droppedFiles.length > 0) {
                        // Check if adding these files would exceed the 9-file limit
                        const totalFileCount = uploadData.images.length + droppedFiles.length;
                        
                        if (totalFileCount > 9) {
                          alert(`You can only upload a maximum of 9 images. You currently have ${uploadData.images.length} images selected.`);
                          // Only add files up to the limit
                          const remainingSlots = Math.max(0, 9 - uploadData.images.length);
                          const filesToAdd = droppedFiles.slice(0, remainingSlots);
                          
                          if (filesToAdd.length > 0) {
                            setUploadData(prevState => ({
                              ...prevState,
                              images: [...prevState.images, ...filesToAdd]
                            }));
                            
                            // Generate previews only for files we're adding
                            filesToAdd.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(prevPreviews => [...prevPreviews, reader.result]);
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        } else {
                          // No limit problems, add all files
                          setUploadData(prevState => ({
                            ...prevState,
                            images: [...prevState.images, ...droppedFiles]
                          }));
                          
                          // Generate previews for dropped files
                          droppedFiles.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(prevPreviews => [...prevPreviews, reader.result]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                  <ImageIcon sx={{ fontSize: 40, color: '#F16A2D', mb: 2 }} />
                  <Typography variant="body1" align="center" sx={{ color: '#666' }}>
                    Drag & drop images here or click to upload
                  </Typography>
                  <Typography variant="caption" align="center" sx={{ color: '#888', mt: 1 }}>
                    Supported formats: JPEG, PNG, GIF
                  </Typography>                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {uploadData.images.length} of 9 images selected
                  </Typography>
                  
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #f48b4a 0%, #F16A2D 100%) !important',
                      color: 'white',
                      '&:hover': { opacity: 0.9 },
                      boxShadow: '0 4px 12px rgba(241, 106, 45, 0.2)'
                    }}
                    disabled={uploadData.images.length >= 9}
                  >
                    Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
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
            <Box component="form" sx={{ mt: 2 }}>              {/* Profile Picture Upload */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 1 }}>
                <Box className="profile-picture-upload">
                  <Avatar
                    src={profileImagePreview || chefData.profilePicture || '/icons/orange-chef.png'}
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
                  >
                    <EditIcon className="profile-picture-icon" />
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
              {isChef() && (
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
          </DialogContent>          <DialogActions>
            <Button 
              onClick={handleCloseEditDialog} 
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
      </Container>
    </Box>
  );
}

export default ChefProfile;