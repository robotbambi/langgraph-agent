"use client";

import { agent } from "./agent";
import styles from "./page.module.css";
import React, { useState } from 'react';

import { HumanMessage } from "@langchain/core/messages";

interface Message {
  sender: string;
  text: string;
}

export default function Home() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleKeyPress = async (event: { key: string; }) => {
    if (event.key === 'Enter') {
      // Perform the button action here
      await sendMessage();
    }
  };

  const sendMessage = async () => {
    let newMessages = messages;
    if (newMessage.trim() !== '') {
      newMessages.push({ sender: 'You', text: newMessage });
      setMessages(newMessages);
      try {
        // Use the agent
        const agentResponse = await agent.invoke({
          messages: [new HumanMessage(newMessage)],
        });
        newMessages.push({ sender: 'Agent', text: agentResponse.messages[agentResponse.messages.length - 1].content });
        setMessages(newMessages);
      } catch (error) {
        newMessages.push({ sender: 'Error', text: (error as Error).message });
        setMessages(newMessages);
      }
      setNewMessage('');
    }
  };

  // This svg icon is from fontawesome.com
  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 384 512">
      <path fill="white" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
    </svg>
  );

  return (
    <div className={styles.appContainer}>
      <div className={styles.chatArea}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'You' ? 'user' : 'other'}`}>
            <span className="sender">{message.sender}:</span>
            <span className="text">{message.text}</span>
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.userInput}
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          autoFocus
        />
        <button
          onClick={sendMessage}
          className={styles.inputButton}
        ><ArrowIcon /></button>
      </div>
    </div>
  );
}
