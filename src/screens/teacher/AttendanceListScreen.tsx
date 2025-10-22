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

const AttendanceListScreen = () => {
  const { user } = useAuth();
  const { students, attendance } = useData();
  const [selectedClass, setSelectedClass] = useState('class_1');
  const [loading, setLoading] = useState(true);
  const [classAttendance, setClassAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedClass]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const classStudents = students.filter(s => s.classId === selectedClass);
      const today = new Date().toISOString().split('T')[0];
      
      const todayAttendance = attendance.filter(a => 
        classStudents.some(s => s.id === a.studentId) && 
        a.date === today
      );

      const attendanceWithStudents = classStudents.map(student => {
        const studentAttendance = todayAttendance.find(a => a.studentId === student.id);
        return {
          ...student,
          status: studentAttendance?.status || 'not_marked',
          lastAttendance: studentAttendance?.date || null,
        };
      });

      setClassAttendance(attendanceWithStudents);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassOptions = () => {
    return [
      { id: 'class_1', name: 'Class 1A' },
      { id: 'class_2', name: 'Class 2B' },
      { id: 'class_3', name: 'Class 3C' },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#28A745';
      case 'absent':
        return '#DC3545';
      case 'late':
        return '#FFC107';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return 'Not Marked';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F6FED" />
          <Text style={styles.loadingText}>Loading attendance...</Text>
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
              <TeacherHeaderRight />
            </View>
          </View>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherAvatar}>👩‍🏫</Text>
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>{user?.fullName}</Text>
              <Text style={styles.teacherRole}>Teacher</Text>
            </View>
          </View>
        </View>

        {/* Class Selector */}
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Select Class:</Text>
          <View style={styles.classButtons}>
            {getClassOptions().map((classOption) => (
              <TouchableOpacity
                key={classOption.id}
                style={[
                  styles.classButton,
                  selectedClass === classOption.id && styles.selectedClassButton
                ]}
                onPress={() => setSelectedClass(classOption.id)}
              >
                <Text style={[
                  styles.classButtonText,
                  selectedClass === classOption.id && styles.selectedClassButtonText
                ]}>
                  {classOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {classAttendance.filter(s => s.status === 'present').length}
              </Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {classAttendance.filter(s => s.status === 'absent').length}
              </Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {classAttendance.filter(s => s.status === 'late').length}
              </Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {classAttendance.filter(s => s.status === 'not_marked').length}
              </Text>
              <Text style={styles.summaryLabel}>Not Marked</Text>
            </View>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.studentList}>
          <Text style={styles.listTitle}>Students ({classAttendance.length})</Text>
          {classAttendance.map((student) => (
            <View key={student.id} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentGrade}>Grade {student.grade}</Text>
                </View>
              </View>
              <View style={styles.studentStatus}>
                <View style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(student.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(student.status)}
                  </Text>
                </View>
                {student.lastAttendance && (
                  <Text style={styles.lastAttendanceText}>
                    Last: {new Date(student.lastAttendance).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Take Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View Report</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  classSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  classButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedClassButton: {
    backgroundColor: '#2F6FED',
    borderColor: '#2F6FED',
  },
  classButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedClassButtonText: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F6FED',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  studentList: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  studentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  studentDetails: {
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
  studentStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  lastAttendanceText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2F6FED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F6FED',
  },
  secondaryButtonText: {
    color: '#2F6FED',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AttendanceListScreen;
