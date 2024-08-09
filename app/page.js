'use client'
import { useState } from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';

export default function Home() {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: `Hi I'm the Headstarter Support Agent, How can I assist you today?`
    }]);
    const [message, setMessage] = useState('');

    const sendMessage = async () => {
        const newMessages = [...messages, { role: "user", content: message }];

        setMessages([...newMessages, { role: "assistant", content: "" }]);
        setMessage("");

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: newMessages })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let result = '';
        reader.read().then(function processText({ done, value }) {
            if (done) {
                return result;
            }
            const text = decoder.decode(value || new Int8Array(), { stream: true });
            setMessages((prevMessages) => {
                let lastMessage = prevMessages[prevMessages.length - 1];
                if (!lastMessage || lastMessage.role !== 'assistant') {
                    lastMessage = { role: 'assistant', content: '' };
                    prevMessages = [...prevMessages, lastMessage];
                }
                let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
                return [...otherMessages, { role: 'assistant', content: lastMessage.content + text }];
            });
            return reader.read().then(processText);
        });
    };

    return (
        <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <Stack direction="column" width="600px" height="700px" border="1px solid black" p={2} spacing={3}>
                <Stack direction="column" flexGrow={1} overflow="auto" maxHeight="100%" spacing={2}>
                    {messages.map((message, index) => (
                        <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
                            <Box bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} color="white" borderRadius={16} p={3}>
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
