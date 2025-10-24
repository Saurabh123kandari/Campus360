import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import AdminHeaderRight from '../../components/admin/AdminHeaderRight';
import StatCard from '../../components/admin/StatCard';
import PaymentRow from '../../components/admin/PaymentRow';
import { Payment } from '../../components/admin/PaymentRow';

const DashboardScreen = () => {
  const { user } = useAuth();
  const { students, attendance, events, paymentsAdmin } = useData();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    paymentsDue: 0,
    paymentsTotal: 0,
    upcomingEvents: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [students, attendance, events, paymentsAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Calculate total students
      const totalStudents = students.length;

      // Calculate average attendance for current term
      const today = new Date();
      const termStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const termAttendance = attendance.filter(a => {
        const attendanceDate = new Date(a.date);
        return attendanceDate >= termStart;
      });

      const studentAttendanceMap = new Map();
      termAttendance.forEach(a => {
        if (!studentAttendanceMap.has(a.studentId)) {
          studentAttendanceMap.set(a.studentId, { present: 0, total: 0 });
        }
        const stats = studentAttendanceMap.get(a.studentId);
        stats.total++;
        if (a.status === 'present') stats.present++;
      });

      const attendancePercentages = Array.from(studentAttendanceMap.values())
        .map(stats => (stats.present / stats.total) * 100);
      const averageAttendance = attendancePercentages.length > 0
        ? Math.round(attendancePercentages.reduce((sum, p) => sum + p, 0) / attendancePercentages.length)
        : 0;

      // Calculate payments
      const paymentsDue = paymentsAdmin.filter(p => p.status === 'due' || p.status === 'overdue').length;
      const paymentsTotal = paymentsAdmin.length;

      // Calculate upcoming events (next 30 days)
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= nextMonth;
      }).length;

      setDashboardData({
        totalStudents,
        averageAttendance,
        paymentsDue,
        paymentsTotal,
        upcomingEvents,
      });

      // Get recent payments (last 6)
      const sortedPayments = [...paymentsAdmin].sort((a, b) => 
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );
      setRecentPayments(sortedPayments.slice(0, 6));

      // Get recent attendance by class
      const classAttendance = new Map();
      const todayStr = today.toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === todayStr);
      
      students.forEach(student => {
        const studentAttendance = todayAttendance.find(a => a.studentId === student.id);
        if (!classAttendance.has(student.classId)) {
          classAttendance.set(student.classId, { present: 0, total: 0 });
        }
        const classStats = classAttendance.get(student.classId);
        classStats.total++;
        if (studentAttendance?.status === 'present') classStats.present++;
      });

      const classAttendanceArray = Array.from(classAttendance.entries()).map(([classId, stats]) => ({
        classId,
        className: classId.replace('class_', 'Class '),
        present: stats.present,
        total: stats.total,
        percentage: Math.round((stats.present / stats.total) * 100),
      }));

      setRecentAttendance(classAttendanceArray);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = (payment: Payment) => {
    Alert.alert(
      'Mark as Received',
      `Mark payment of ₹${payment.amount} from ${payment.parentName} as received?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Received',
          onPress: () => {
            // TODO: Update payment status in data store
            Alert.alert('Success', 'Payment marked as received!');
          },
        },
      ]
    );
  };

  const handleSendReminder = (payment: Payment) => {
    Alert.alert('Reminder Sent', `Reminder sent to ${payment.parentName}`);
  };

  const handleViewHistory = (payment: Payment) => {
    Alert.alert('Payment History', `Viewing history for ${payment.studentName}`);
  };

  const handleExportCSV = () => {
    Alert.alert('Export CSV', 'CSV export functionality would be implemented here');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F6FED" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logo}>📚 Padmai</Text>
            <View style={styles.headerRight}>
              <Text style={styles.welcomeText}>Welcome, {user?.fullName?.split(' ')[0]}!</Text>
              <AdminHeaderRight />
            </View>
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminAvatar}>👨‍💼</Text>
            <View style={styles.adminDetails}>
              <Text style={styles.adminName}>{user?.fullName}</Text>
              <Text style={styles.adminRole}>School Administrator</Text>
            </View>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoText}>
            📝 Demo Mode: All data is static and changes are in-memory only
          </Text>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <StatCard
              title="Total Students"
              value={dashboardData.totalStudents}
              icon="👥"
              color="#2F6FED"
              accessibilityLabel={`Total students: ${dashboardData.totalStudents}`}
            />
            <StatCard
              title="Avg Attendance"
              value={`${dashboardData.averageAttendance}%`}
              icon="📊"
              color="#28A745"
              subtitle="This term"
              accessibilityLabel={`Average attendance: ${dashboardData.averageAttendance} percent`}
            />
            <StatCard
              title="Payments Due"
              value={`${dashboardData.paymentsDue}/${dashboardData.paymentsTotal}`}
              icon="💳"
              color="#FFC107"
              accessibilityLabel={`Payments due: ${dashboardData.paymentsDue} out of ${dashboardData.paymentsTotal}`}
            />
            <StatCard
              title="Upcoming Events"
              value={dashboardData.upcomingEvents}
              icon="📅"
              color="#6F42C1"
              accessibilityLabel={`Upcoming events: ${dashboardData.upcomingEvents}`}
            />
          </View>
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentPayments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              onMarkReceived={handleMarkReceived}
              onSendReminder={handleSendReminder}
              onViewHistory={handleViewHistory}
            />
          ))}
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Attendance by Class</Text>
          {recentAttendance.map((classData) => (
            <View key={classData.classId} style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.className}>{classData.className}</Text>
                <Text style={styles.attendancePercentage}>
                  {classData.percentage}%
                </Text>
              </View>
              <View style={styles.attendanceBar}>
                <View 
                  style={[
                    styles.attendanceFill, 
                    { width: `${classData.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.attendanceDetails}>
                {classData.present} of {classData.total} students present
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>💳</Text>
              <Text style={styles.quickActionText}>View Payments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Attendance Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleExportCSV}
            >
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    backgroundColor: '#2F6FED',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B3D4FF',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 14,
    color: '#B3D4FF',
  },
  demoNotice: {
    backgroundColor: '#fff3cd',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  demoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  kpiSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2F6FED',
    borderRadius: 8,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attendancePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F6FED',
  },
  attendanceBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#2F6FED',
    borderRadius: 4,
  },
  attendanceDetails: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;
