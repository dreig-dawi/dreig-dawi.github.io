import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants.ts';
import { 
  Container, Paper, Box, TextField, Button, 
  Typography, Avatar, IconButton, Divider,
  CircularProgress, List, ListItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Chat.css';

function Chat() {
  const { username } = useParams(); // Username of the chef/user to chat with
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showConversations, setShowConversations] = useState(true);
  const [error, setError] = useState('');
  
  // Polling interval reference
  const pollIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Fetch the list of conversations
  const fetchConversations = useCallback(async (retryCount = 0) => {
    try {
      // Verify auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // Check if user data is available
      if (!currentUser || !currentUser.username) {
        console.error('Current user data is not available');
        if (retryCount < 3) {
          // Try again after a delay if user data isn't available yet (race condition)
          console.log(`User data not available, retrying in 1 second (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => fetchConversations(retryCount + 1), 1000);
          return;
        }
        setError('User data not loaded. Please refresh the page.');
        return;
      }
      
      // Add a timestamp to prevent caching
      const url = `${endpoint}/chat/conversations?_t=${new Date().getTime()}`;
      
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        console.warn('Backend returned non-array response for conversations:', response.data);
        setConversations([]);
      }
      
      setLoading(false);
      
      // If we got an empty array but there's a username from the URL,
      // we might need to initialize a conversation with that user
      if (Array.isArray(response.data) && response.data.length === 0 && username) {
        console.log(`No conversations found but URL has username ${username}, prepping new conversation`);
        
        // No need to fetch recipient profile as it's handled elsewhere
        if (!recipient) {
          fetchRecipientProfile(username);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (retryCount < 2) {
        // Try again after a delay
        console.log(`Error fetching conversations, retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => fetchConversations(retryCount + 1), (retryCount + 1) * 1000);
        return;
      }
      
      setError(`Failed to load conversations: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, [currentUser, username, recipient, fetchRecipientProfile]);
  
  // Fetch profile of the chat recipient
  const fetchRecipientProfile = useCallback(async (recipientUsername) => {
    try {
      const url = `${endpoint}/users/profile/${recipientUsername}`;
      
      const response = await axios.get(url);
      setRecipient(response.data);
    } catch (error) {
      console.error('Error fetching recipient profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to load user profile: ${error.response?.data?.message || error.message}`);
    }
  }, []);
  
  // Helper function to update conversations list when a new message is received
  const updateConversationsList = useCallback((newMessage) => {
    if (!currentUser) return;
    
    setConversations(prevConversations => {
      // Determine if sender or recipient
      const isReceiver = newMessage.senderUsername !== currentUser.username;
      const conversationParticipantId = isReceiver ? newMessage.senderId : newMessage.recipientId;
      const conversationUsername = isReceiver ? newMessage.senderUsername : newMessage.recipientUsername;
      
      // Check if conversation exists
      const conversationExists = prevConversations.some(
        conv => conv.participantId === conversationParticipantId
      );
      
      if (!conversationExists) {
        // Add new conversation
        return [...prevConversations, {
          participantId: conversationParticipantId,
          username: conversationUsername,
          lastMessage: newMessage.content,
          timestamp: newMessage.timestamp
        }];
      }
      
      // Update existing conversation
      return prevConversations.map(conv => {
        if (conv.participantId === conversationParticipantId) {
          return {
            ...conv,
            lastMessage: newMessage.content,
            timestamp: newMessage.timestamp
          };
        }
        return conv;
      });
    });
  }, [currentUser]);
  
  // Fetch chat messages for a specific conversation
  const fetchMessages = useCallback(async (participantId, participantUsername) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const url = `${endpoint}/chat/messages/${participantId}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(response.data);
      setActiveConversation({
        id: participantId,
        username: participantUsername
      });
      
      // Get recipient details
      fetchRecipientProfile(participantUsername);
      
      // On mobile, show the chat and hide the conversations list
      if (isMobileView) {
        setShowConversations(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to load messages: ${error.response?.data?.message || error.message}`);
      setLoading(false);
    }
  }, [isMobileView, fetchRecipientProfile]);
  
  // Initialize polling for new messages
  const startPolling = useCallback(() => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // Set up polling every 15 seconds
    pollIntervalRef.current = setInterval(() => {
      if (activeConversation?.id) {
        fetchMessages(activeConversation.id, activeConversation.username);
      }
      fetchConversations();
    }, 15000); // Poll every 15 seconds
    
  }, [activeConversation, fetchMessages, fetchConversations]);
  
  // Check authentication and start initial data fetch
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Add a small delay to ensure authentication context is fully loaded
    const timer = setTimeout(() => {
      console.log('Initiating conversations fetch...');
      fetchConversations();
    }, 1000); // Increased delay to 1000ms to ensure auth context is ready
    
    // Cleanup interval on unmount
    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isAuthenticated, navigate, fetchConversations]);
  
  // Start polling for new messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      console.log('Active conversation set, starting polling:', activeConversation);
      startPolling();
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeConversation, startPolling]);
  
  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // When a specific chef is selected from the URL
  useEffect(() => {
    if (username && currentUser) {
      console.log('URL parameter detected, username:', username);
      
      // Find the conversation if it exists
      const conversation = conversations.find(conv => conv.username === username);
      
      if (conversation) {
        console.log('Existing conversation found:', conversation);
        fetchMessages(conversation.participantId, username);
      } else {
        console.log('No existing conversation found for:', username);
        console.log('Starting new conversation');
        
        // If no existing conversation, fetch the user profile to start a new conversation
        fetchRecipientProfile(username);
        setActiveConversation({
          username: username
        });
        
        // On mobile, show the chat view
        if (isMobileView) {
          setShowConversations(false);
        }
      }
    }
  }, [username, currentUser, conversations, isMobileView, fetchMessages, fetchRecipientProfile, fetchConversations]);
  
  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const messageData = {
        recipientUsername: activeConversation.username,
        content: message.trim()
      };
      
      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        recipientUsername: activeConversation.username,
        content: message.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Add to messages
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Clear the input
      setMessage('');
      
      // Send to server
      const url = `${endpoint}/chat/send`;
      
      const response = await axios.post(url, messageData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      // After sending the first message, immediately fetch conversations to update the list
      if (!activeConversation.id) {
        console.log('First message in a new conversation - updating conversation list');
        setTimeout(() => {
          fetchConversations();
        }, 500); // Small delay to allow backend to process
      } else {
        // Immediately fetch updated messages to confirm delivery
        fetchMessages(activeConversation.id, activeConversation.username);
        // Also refresh conversations list to show latest message
        fetchConversations();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const goBackToConversations = () => {
    setShowConversations(true);
  };
  
  if (loading && !conversations.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#F16A2D' }} />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" className="chat-container">
      {error && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: '#ffebee', 
            color: '#c62828',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{error}</Typography>
          <Box>
            <Button size="small" onClick={() => window.location.reload()} sx={{ mr: 1 }}>Refresh</Button>
            <Button size="small" onClick={() => setError('')}>Dismiss</Button>
          </Box>
        </Paper>
      )}
      
      <Paper elevation={3} className="chat-paper">
        <Box className="chat-wrapper">
          {/* Conversations List */}
          {(!isMobileView || showConversations) && (
            <Box className="conversations-container">
              <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                Conversations
              </Typography>
              
              {conversations.length > 0 ? (
                <List>
                  {conversations.map((conv) => (
                    <ListItem 
                      key={conv.participantId}
                      button
                      className={`conversation-item ${activeConversation?.id === conv.participantId ? 'active' : ''}`}
                      onClick={() => fetchMessages(conv.participantId, conv.username)}
                    >
                      <Box className="conversation-avatar">
                        <Avatar alt={conv.username}>
                          {conv.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                      <Box className="conversation-details">
                        <Typography variant="subtitle2">{conv.username}</Typography>
                        <Typography variant="body2" noWrap sx={{ color: '#666' }}>
                          {conv.lastMessage}
                        </Typography>
                      </Box>
                      {conv.timestamp && (
                        <Typography variant="caption" sx={{ color: '#888', ml: 'auto' }}>
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Start chatting with a chef to see conversations here
                  </Typography>
                  {username && (
                    <Button 
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2, bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
                      onClick={() => {
                        // Set up active conversation with the user from URL param
                        setActiveConversation({ username: username });
                        if (isMobileView) {
                          setShowConversations(false);
                        }
                      }}
                    >
                      Chat with {username}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}
          
          {/* Chat Area */}
          {(!isMobileView || !showConversations) && activeConversation && (
            <Box className="chat-messages-container">
              {/* Chat Header */}
              <Box className="chat-header">
                {isMobileView && (
                  <IconButton onClick={goBackToConversations} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                
                <Avatar 
                  src={recipient?.profilePicture} 
                  alt={activeConversation.username}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {activeConversation.username.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="h6">
                  {activeConversation.username}
                </Typography>
              </Box>
              
              <Divider />
              
              {/* Messages */}
              <Box className="messages-container">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <Box 
                      key={index}
                      className={`message ${msg.senderUsername === currentUser.username ? 'sent' : 'received'}`}
                    >
                      <Box className="message-content">
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                          {formatTimestamp(msg.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Message Input */}
              <Box className="message-input-container">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  sx={{ bgcolor: '#F16A2D', '&:hover': { bgcolor: '#d45c26' } }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Empty State (no active conversation) */}
          {(!isMobileView || !showConversations) && !activeConversation && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                p: 3,
                flex: 1
              }}
            >
              <img src="/icons/chef-hat.svg" alt="Chef Hat" style={{ width: 80, marginBottom: 20, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Choose a conversation from the list or find a chef to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Chat;
