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
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${endpoint}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  }, []);
  
  // Fetch profile of the chat recipient
  const fetchRecipientProfile = useCallback(async (recipientUsername) => {
    try {
      const response = await axios.get(`${endpoint}/users/profile/${recipientUsername}`);
      setRecipient(response.data);
    } catch (error) {
      console.error('Error fetching recipient profile:', error);
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
      
      const response = await axios.get(`${endpoint}/chat/messages/${participantId}`, {
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
      navigate('/login');
      return;
    }
    
    // Fetch initial data
    fetchConversations();
    
    // Cleanup interval on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isAuthenticated, navigate, fetchConversations]);
  
  // Start polling for new messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
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
      // Find the conversation if it exists
      const conversation = conversations.find(conv => conv.username === username);
      
      if (conversation) {
        fetchMessages(conversation.participantId, username);
      } else {
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
  }, [username, currentUser, conversations, isMobileView, fetchMessages, fetchRecipientProfile]);
  
  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
    const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    try {
      const token = localStorage.getItem('authToken');
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
      await axios.post(`${endpoint}/chat/send`, messageData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      // Immediately fetch updated messages to confirm delivery
      if (activeConversation.id) {
        fetchMessages(activeConversation.id, activeConversation.username);
      }
      
      // Also refresh conversations list to show latest message
      fetchConversations();
      
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
          <Typography variant="body2">{error}</Typography>
          <Button size="small" onClick={() => setError('')}>Dismiss</Button>
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