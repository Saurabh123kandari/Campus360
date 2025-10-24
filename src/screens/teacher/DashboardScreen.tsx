import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import TeacherHeaderRight from '../../components/teacher/TeacherHeaderRight';
import ProfileModal from './ProfileModal';

const DashboardScreen = () => {
  const { user } = useAuth();
  const { students, attendance, events } = useData();
  const [selectedClass, setSelectedClass] = useState('class_1');
  const [loading, setLoading] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [classStats, setClassStats] = useState({
    present: 0,
    absent: 0,
    total: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedClass]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate loading delay
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const classStudents = students.filter(s => s.classId === selectedClass);
      const today = new Date().toISOString().split('T')[0];
      
      const todayAttendance = attendance.filter(a => 
        classStudents.some(s => s.id === a.studentId) && 
        a.date === today
      );

      const present = todayAttendance.filter(a => a.status === 'present').length;
      const absent = todayAttendance.filter(a => a.status === 'absent').length;

      setClassStats({
        present,
        absent,
        total: classStudents.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassOptions = () => {
    // TODO: Get teacher's actual classes
    return [
      { id: 'class_1', name: 'Class 1A' },
      { id: 'class_2', name: 'Class 2B' },
      { id: 'class_3', name: 'Class 3C' },
    ];
  };

  const getClassStudents = () => {
    return students.filter(s => s.classId === selectedClass);
  };

  const getRecentActivity = () => {
    // TODO: Get actual recent activity
    return [
      { id: '1', type: 'task', message: 'Created Math assignment', time: '2 hours ago' },
      { id: '2', type: 'event', message: 'Added parent meeting to calendar', time: '4 hours ago' },
      { id: '3', type: 'chat', message: 'Received message from Sarah\'s parent', time: '1 day ago' },
    ];
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
              <TeacherHeaderRight onPress={() => setProfileModalVisible(true)} />
            </View>
          </View>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherAvatar}>👩‍🏫</Text>
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>{user?.fullName}</Text>
              <Text style={styles.teacherRole}>Mathematics Teacher</Text>
            </View>
          </View>
          
          <View style={styles.classSelector}>
            <Text style={styles.selectorLabel}>Current Class:</Text>
            <TouchableOpacity style={styles.selectorButton}>
              <Text style={styles.selectorButtonText}>
                {getClassOptions().find(c => c.id === selectedClass)?.name || 'Select Class'}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Classes</Text>
          <View style={styles.classCards}>
            {getClassOptions().map((classOption) => (
              <TouchableOpacity
                key={classOption.id}
                style={[
                  styles.classCard,
                  selectedClass === classOption.id && styles.selectedClassCard
                ]}
                onPress={() => setSelectedClass(classOption.id)}
              >
                <Text style={styles.classCardTitle}>{classOption.name}</Text>
                <Text style={styles.classCardCount}>
                  {students.filter(s => s.classId === classOption.id).length} students
                </Text>
                <TouchableOpacity style={styles.takeAttendanceButton}>
                  <Text style={styles.takeAttendanceButtonText}>Take Attendance</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{classStats.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{classStats.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{classStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students ({getClassStudents().length})</Text>
          {getClassStudents().map((student) => (
            <View key={student.id} style={styles.studentItem}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentGrade}>Grade {student.grade}</Text>
              </View>
              <View style={styles.studentActions}>
                <Text style={styles.attendancePercentage}>85%</Text>
                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {getRecentActivity().map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text style={styles.activityIcon}>
                {activity.type === 'task' ? '📝' : activity.type === 'event' ? '📅' : '💬'}
              </Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>✅</Text>
              <Text style={styles.quickActionText}>Take Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>View Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
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
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  teacherRole: {
    fontSize: 14,
    color: '#B3D4FF',
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 16,
    color: '#fff',
    marginRight: 12,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectorButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  selectorArrow: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  classCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedClassCard: {
    borderWidth: 2,
    borderColor: '#2F6FED',
  },
  classCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  classCardCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  takeAttendanceButton: {
    backgroundColor: '#2F6FED',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  takeAttendanceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F6FED',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  studentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F6FED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentGrade: {
    fontSize: 14,
    color: '#666',
  },
  studentActions: {
    alignItems: 'flex-end',
  },
  attendancePercentage: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
    marginBottom: 4,
  },
  messageButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  messageButtonText: {
    color: '#2F6FED',
    fontSize: 12,
    fontWeight: '600',
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
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
