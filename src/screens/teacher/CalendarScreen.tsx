import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import TeacherHeaderRight from '../../components/teacher/TeacherHeaderRight';
import MonthGrid from '../../components/calendar/MonthGrid';
import EventListItem from '../../components/EventListItem';

const CalendarScreen = () => {
  const { user } = useAuth();
  const { events, users, students } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadEvents();
  }, [events, user?.role]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // TODO: Filter events by teacher's classes
      const allEvents = events || [];
      setFilteredEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const userData = users.find(u => u.id === userId);
    return userData ? userData.fullName : 'Unknown Teacher';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleCreateEvent = () => {
    // TODO: Navigate to event editor
    console.debug('Create event functionality will be implemented');
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toISOString().split('T')[0] === dateKey;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F6FED" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('prev')}>
              <Text style={styles.navButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <View style={styles.monthInfo}>
              <Text style={styles.monthText}>
                {formatMonthYear(currentDate)}
              </Text>
              <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('next')}>
              <Text style={styles.navButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <MonthGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={filteredEvents}
          onDateSelect={handleDateSelect}
        />

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>
              {formatSelectedDate(selectedDate)}
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
              <Text style={styles.createButtonText}>+ Create Event</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.eventsCount}>{getEventsForSelectedDate().length} events</Text>
          
          {getEventsForSelectedDate().length > 0 ? (
            getEventsForSelectedDate().map(event => (
              <EventListItem
                key={event.id}
                event={event}
                createdByName={getUserName(event.createdBy)}
                onPress={handleEventPress}
              />
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>No events for this date</Text>
              <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
                <Text style={styles.createEventButtonText}>Create your first event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEvent?.title || 'Event Details'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalDetail}>
                  📅 {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
                <Text style={styles.modalDetail}>
                  📝 Notes: {selectedEvent.notes || 'N/A'}
                </Text>
                {selectedEvent.studentId && (
                  <Text style={styles.modalDetail}>
                    🧑‍🎓 Student: {students.find(s => s.id === selectedEvent.studentId)?.name || 'N/A'}
                  </Text>
                )}
                {selectedEvent.classId && (
                  <Text style={styles.modalDetail}>
                    🏫 Class: {selectedEvent.classId.replace('class_', 'Class ')}
                  </Text>
                )}
                <Text style={styles.modalDetail}>
                  👨‍🏫 Created By: {getUserName(selectedEvent.createdBy)}
                </Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Edit Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                    <Text style={styles.actionButtonText}>Delete Event</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  calendarHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#2F6FED',
    fontWeight: 'bold',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayButton: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#2F6FED',
    borderRadius: 10,
  },
  todayButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  eventsSection: {
    marginTop: 8,
    padding: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventsCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  createEventButton: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  modalDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#2F6FED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarScreen;
