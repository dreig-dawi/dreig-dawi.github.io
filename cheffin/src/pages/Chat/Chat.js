import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { endpoint } from '../../Utils/Constants';
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
  
  // Track conversation fetches to prevent excessive API calls
  // We don't need the fetchTime state since we've already optimized with a different approach
  
  // Polling interval reference
  const pollIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);  // Fetch profile of the chat recipient (with caching)
  const fetchRecipientProfile = useCallback(async (recipientUsername) => {
    // Don't fetch if we already have this recipient's profile
    if (recipient && recipient.username === recipientUsername) {
      console.log(`Already have profile for ${recipientUsername}, skipping fetch`);
      return; // Already have this recipient's profile
    }
    
    console.log(`Fetching profile for user: ${recipientUsername}`);
    try {
      const url = `${endpoint}/users/profile/${recipientUsername}`;
      
      const response = await axios.get(url);
      console.log(`Successfully fetched profile for ${recipientUsername}`);
      setRecipient(response.data);
    } catch (error) {
      console.error('Error fetching recipient profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to load user profile: ${error.response?.data?.message || error.message}`);
    }
  }, [recipient]);
  
  // Fetch the list of conversations  
  const fetchConversations = useCallback(async (retryCount = 0) => {
    try {
      console.log('Fetching conversations...');
      // Verify auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        return [];
      }
      
      // Check if user data is available
      if (!currentUser || !currentUser.username) {
        console.error('Current user data is not available');
        if (retryCount < 3) {
          // Try again after a delay if user data isn't available yet (race condition)
          console.log(`User data not available, retrying in 1 second (attempt ${retryCount + 1}/3)...`);
          return new Promise(resolve => {
            setTimeout(async () => {
              const result = await fetchConversations(retryCount + 1);
              resolve(result);
            }, 1000);
          });
        }
        setError('User data not loaded. Please refresh the page.');
        return [];
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
      
      let conversationsData = [];
      if (Array.isArray(response.data)) {
        conversationsData = response.data;
        setConversations(conversationsData);
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
      
      return conversationsData;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (retryCount < 2) {
        // Try again after a delay
        console.log(`Error fetching conversations, retrying in ${(retryCount + 1) * 1000}ms...`);
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await fetchConversations(retryCount + 1);
            resolve(result);
          }, (retryCount + 1) * 1000);
        });
      }
      
      setError(`Failed to load conversations: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setLoading(false);
      return [];
    }
  }, [currentUser, username, recipient, fetchRecipientProfile]);
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
    console.log(`Fetching messages for participant ID: ${participantId}, username: ${participantUsername}`);
    
    if (!participantId) {
      console.error('Cannot fetch messages: participantId is undefined');
      setError('Cannot load messages: Invalid user ID');
      setLoading(false);
      return;
    }
    
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
      console.log(`Sending GET request to: ${url}`);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`Received ${response.data.length} messages`);
      setMessages(response.data);
      
      // Update active conversation with both id and username
      setActiveConversation({
        id: participantId,
        username: participantUsername
      });
      console.log(`Active conversation set to ID: ${participantId}, username: ${participantUsername}`);
      
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
      
      // Prevent users from chatting with themselves
      if (username === currentUser.username) {
        console.log('Cannot chat with yourself, redirecting to main chat page');
        navigate('/chat');
        return;
      }
      
      // Find the conversation if it exists
      const conversation = conversations.find(conv => conv.username === username);
      
      if (conversation) {
        console.log('Existing conversation found:', conversation);
        fetchMessages(conversation.participantId, username);
      } else {
        console.log('No existing conversation found for:', username);
        console.log('Starting new conversation');
        
        // If no existing conversation, fetch the user profile to start a new conversation
        // Only fetch if we don't already have this recipient's profile
        if (!recipient || recipient.username !== username) {
          fetchRecipientProfile(username);
        }
        
        // Set active conversation only if it's not already set
        if (!activeConversation || activeConversation.username !== username) {
          setActiveConversation({
            username: username
          });
          
          // On mobile, show the chat view
          if (isMobileView) {
            setShowConversations(false);
          }
        }
      }
    }
  }, [username, currentUser, conversations, isMobileView, fetchMessages, fetchRecipientProfile, recipient, activeConversation, navigate]);
  
  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    // Prevent sending messages to yourself
    if (currentUser && activeConversation.username === currentUser.username) {
      setError("You cannot send messages to yourself");
      return;
    }
    
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
      
      await axios.post(url, messageData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      // Use the updateConversationsList function to update the UI immediately
      updateConversationsList(optimisticMessage);      // After sending the first message, immediately fetch conversations to update the list
      if (!activeConversation.id) {
        console.log('First message in a new conversation - updating conversation list');
        
        // Wait a bit for the server to process the message
        setTimeout(async () => {
          try {
            // First fetch the conversations to get the updated conversation list with IDs
            const updatedConversationsData = await fetchConversations();
            console.log('Fetched updated conversations:', updatedConversationsData);
            
            // After fetching conversations, find the conversation with this recipient
            const updatedConversation = updatedConversationsData.find(conv => conv.username === activeConversation.username);
            
            if (updatedConversation && updatedConversation.participantId) {
              console.log('Found matching conversation with ID:', updatedConversation.participantId);
              
              // Update the active conversation with the ID
              setActiveConversation({
                id: updatedConversation.participantId,
                username: activeConversation.username
              });
              
              // Now fetch messages using the valid participantId
              fetchMessages(updatedConversation.participantId, activeConversation.username);
            } else {
              console.warn('Could not find conversation with username:', activeConversation.username);
              console.warn('Available conversations:', updatedConversationsData);
              
              // Try one more time with a longer delay
              setTimeout(async () => {
                const finalAttemptData = await fetchConversations();
                const finalConversation = finalAttemptData.find(conv => conv.username === activeConversation.username);
                
                if (finalConversation && finalConversation.participantId) {
                  setActiveConversation({
                    id: finalConversation.participantId,
                    username: activeConversation.username
                  });
                  fetchMessages(finalConversation.participantId, activeConversation.username);
                }
              }, 1000);
            }
          } catch (error) {
            console.error('Error updating conversation after first message:', error);
          }
        }, 500); // Small delay to allow backend to process
      } else {
        // Immediately fetch updated messages to confirm delivery
        fetchMessages(activeConversation.id, activeConversation.username);
        
        // Also refresh conversations list to show latest message
        setTimeout(() => {
          fetchConversations();
        }, 500); // Small delay to allow backend to process
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
                  {conversations
                    .filter(conv => currentUser && conv.username !== currentUser.username) // Filter out self conversations
                    .map((conv) => (
                    <ListItem 
                      key={conv.participantId}
                      button
                      className={`conversation-item ${activeConversation?.id === conv.participantId ? 'active' : ''}`}
                      onClick={() => fetchMessages(conv.participantId, conv.username)}
                    >
                      <Box className="conversation-avatar">
                        <Avatar 
                          src={'/icons/default-avatar.png'}
                          alt={conv.username}
                        >
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
