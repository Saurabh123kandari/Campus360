import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
// Using emoji icons instead of vector icons for better compatibility
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import { useToast } from '../../contexts/ToastContext';

const HomeDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const { students, attendance, events, payments } = useData();
  const { showToast } = useToast();
  const [child, setChild] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState({
    nextDue: 0,
    status: 'paid',
    overdue: 0,
  });

  useEffect(() => {
    if (user?.childId) {
      // Find child information
      const childData = students.find(s => s.id === user.childId);
      setChild(childData);

      // Calculate attendance stats for last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentAttendance = attendance.filter(att => 
        att.studentId === user.childId && 
        new Date(att.date) >= sevenDaysAgo
      );

      const present = recentAttendance.filter(att => att.status === 'present').length;
      const absent = recentAttendance.filter(att => att.status === 'absent').length;
      const total = recentAttendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      setAttendanceStats({ present, absent, total, percentage });

      // Get upcoming events (next 3)
      const upcoming = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingEvents(upcoming);

      // Get payment status
      const childPayments = payments.filter(p => p.studentId === user.childId);
      const pendingPayments = childPayments.filter(p => p.status === 'pending');
      const overduePayments = childPayments.filter(p => p.status === 'overdue');
      const nextDue = pendingPayments.length > 0 ? pendingPayments[0].amount : 0;
      const status = overduePayments.length > 0 ? 'overdue' : 
                   pendingPayments.length > 0 ? 'pending' : 'paid';

      setPaymentStatus({
        nextDue,
        status,
        overdue: overduePayments.length,
      });
    }
  }, [user, students, attendance, events, payments]);

  const handleQuickAction = (action: string) => {
    showToast(`${action} feature will be implemented`, 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Due';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🎓</Text>
              <Text style={styles.appName}>Padmai</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeText}>Welcome, {user?.fullName?.split(' ')[0]}!</Text>
          <View style={styles.childInfo}>
            <Text style={styles.childAvatar}>👦</Text>
            <View>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childGrade}>{child.grade}</Text>
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          {/* Attendance Card */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardTitle}>Attendance Today</Text>
            </View>
            <Text style={styles.attendanceStats}>
              {attendanceStats.present} present / {attendanceStats.absent} absent
            </Text>
            <Text style={styles.attendancePercentage}>
              {attendanceStats.percentage}% attendance
            </Text>
            <View style={styles.sparkline}>
              {Array.from({ length: 7 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.sparklineDot,
                    { backgroundColor: i < attendanceStats.present ? '#4CAF50' : '#E0E0E0' }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Events Card */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📅</Text>
              <Text style={styles.cardTitle}>Upcoming Events</Text>
            </View>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <View key={event.id} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date} at {event.time}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>No upcoming events</Text>
            )}
          </View>

          {/* Payments Card */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💰</Text>
              <Text style={styles.cardTitle}>Payments</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentAmount}>₹{paymentStatus.nextDue}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(paymentStatus.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(paymentStatus.status)}
                </Text>
              </View>
            </View>
            {paymentStatus.overdue > 0 && (
              <Text style={styles.overdueText}>
                {paymentStatus.overdue} payment(s) overdue
              </Text>
            )}
            <TouchableOpacity style={styles.viewPaymentsButton}>
              <Text style={styles.viewPaymentsText}>View Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📝</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Teacher Message</Text>
                <Text style={styles.activityDescription}>
                  "Alex had a great day in class today!"
                </Text>
                <Text style={styles.activityTime}>Updated 2 days ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>💰</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment Update</Text>
                <Text style={styles.activityDescription}>
                  Transportation fee marked as paid
                </Text>
                <Text style={styles.activityTime}>Updated 1 week ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📊</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Attendance Update</Text>
                <Text style={styles.activityDescription}>
                  Present for all classes this week
                </Text>
                <Text style={styles.activityTime}>Updated 3 days ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📅</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Event</Text>
                <Text style={styles.activityDescription}>
                  Parent-Teacher Meeting scheduled
                </Text>
                <Text style={styles.activityTime}>Updated 5 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('View Attendance')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Open Calendar')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Open Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Mark Payment')}
            >
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Mark Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('Message Teacher')}
            >
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionText}>Message Teacher</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            💡 Payments are processed via school portal
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2F6FED',
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIconText: {
    fontSize: 18,
    color: '#2F6FED',
  },
  logo: {
    fontSize: 24,
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  childGrade: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attendanceStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  attendancePercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  sparkline: {
    flexDirection: 'row',
    gap: 4,
  },
  sparklineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventItem: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  overdueText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
  },
  viewPaymentsButton: {
    backgroundColor: '#2F6FED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewPaymentsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  activitySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  quickActionsSection: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  footerInfo: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeDashboard;
