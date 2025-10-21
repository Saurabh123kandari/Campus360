import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';

const ChatScreen = () => {
  const { user } = useAuth();
  const { events } = useData();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize with some demo messages
    const demoMessages = [
      {
        id: 'msg-1',
        sender: 'teacher',
        senderName: 'Ms. Sarah Wilson',
        message: 'Good morning! Alex had a great day in class today. He participated actively in the science experiment.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'message',
      },
      {
        id: 'msg-2',
        sender: 'parent',
        senderName: user?.fullName || 'Parent',
        message: 'Thank you for the update! I\'m glad to hear Alex is doing well.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'message',
      },
      {
        id: 'msg-3',
        sender: 'teacher',
        senderName: 'Ms. Sarah Wilson',
        message: 'I\'ve created a new task for Alex to complete by next week.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        type: 'task',
        taskId: 'task-1',
        taskTitle: 'Complete Science Project',
        taskDescription: 'Research and present findings on renewable energy sources.',
        taskDueDate: '2024-02-20',
      },
      {
        id: 'msg-4',
        sender: 'parent',
        senderName: user?.fullName || 'Parent',
        message: 'I\'ll make sure Alex completes the science project on time. Thank you for the reminder.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'message',
      },
    ];
    
    setMessages(demoMessages);
  }, [user]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `msg-${Date.now()}`,
      sender: 'parent',
      senderName: user?.fullName || 'Parent',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate teacher response
    setTimeout(() => {
      const teacherResponse = {
        id: `msg-${Date.now() + 1}`,
        sender: 'teacher',
        senderName: 'Ms. Sarah Wilson',
        message: 'Thank you for your message. I\'ll get back to you soon.',
        timestamp: new Date().toISOString(),
        type: 'message',
      };
      setMessages(prev => [...prev, teacherResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleViewTask = (taskId: string) => {
    // In a real app, this would navigate to the task details
    console.log('View task:', taskId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isParent = message.sender === 'parent';
    const showDate = index === 0 || 
      formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <View key={message.id}>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(message.timestamp)}</Text>
          </View>
        )}
        
        {message.type === 'task' ? (
          <View style={styles.taskMessage}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskSender}>{message.senderName}</Text>
              <Text style={styles.taskTime}>{formatTime(message.timestamp)}</Text>
            </View>
            <Text style={styles.taskMessageText}>{message.message}</Text>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{message.taskTitle}</Text>
              <Text style={styles.taskDescription}>{message.taskDescription}</Text>
              <Text style={styles.taskDueDate}>Due: {message.taskDueDate}</Text>
              <TouchableOpacity
                style={styles.viewTaskButton}
                onPress={() => handleViewTask(message.taskId)}
              >
                <Text style={styles.viewTaskButtonText}>View Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[
            styles.messageContainer,
            isParent ? styles.parentMessage : styles.teacherMessage
          ]}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageSender}>{message.senderName}</Text>
              <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
            </View>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <Text style={styles.headerSubtitle}>Ms. Sarah Wilson (Class Teacher)</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Ms. Sarah Wilson is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2F6FED',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  parentMessage: {
    alignSelf: 'flex-end',
  },
  teacherMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  taskMessage: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskSender: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  taskTime: {
    fontSize: 11,
    color: '#999',
  },
  taskMessageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  viewTaskButton: {
    backgroundColor: '#2F6FED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewTaskButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  typingIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChatScreen;
