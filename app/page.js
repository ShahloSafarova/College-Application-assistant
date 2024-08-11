"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm here to assist you with your college application process. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    // Add the user's message and a placeholder for the assistant's reply
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      // Update the last message with the response text
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
      setMessage(''); // Clear the input field
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="#e3f2fd" // Sky blue background color
    >
      <Stack
        direction={'column'}
        width="800px" // Increased width of the chat container
        height="650px" // Fixed height of the chat container
        border="1px solid #81d4fa" // Light border color
        bgcolor="white" // White background for the chat area
        p={2}
        spacing={2}
        borderRadius={2} // Rounded corners for a softer look
        display="flex"
        flexDirection="column"
      >
        {/* Logo Section */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius={1}
        >
          <img
            src="https://thumbs.dreamstime.com/b/educate-blue-round-flat-design-vector-icon-isolated-white-background-education-graduate-male-student-illustration-eps-178412478.jpg" // Your logo URL
            alt="Logo"
            style={{ height: '100px', width: '100px', borderRadius: '50%' }} // Circular logo
          />
        </Box>

        {/* Chat Messages */}
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto" // Enable scrolling for messages
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#b3e5fc' // Light blue for assistant messages
                    : '#c5e1a5' // Light green for user messages
                }
                color="black" // Black text color
                borderRadius={16}
                p={2}
                maxWidth="75%" // Limit the width of the message boxes
                boxShadow={1} // Optional: Adds shadow for depth
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        {/* Input Area */}
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ bgcolor: '#bbdefb', '&:hover': { bgcolor: '#bbdefb' } }} // Sky blue button
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
