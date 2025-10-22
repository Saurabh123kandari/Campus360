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
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';

const TakeAttendanceScreen = () => {
  const { user } = useAuth();
  const { students, attendance } = useData();
  const [selectedClass, setSelectedClass] = useState('class_1');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    initializeAttendance();
  }, [selectedClass]);

  const initializeAttendance = () => {
    const classStudents = students.filter(s => s.classId === selectedClass);
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = attendance.filter(a => 
      classStudents.some(s => s.id === a.studentId) && 
      a.date === today
    );

    const initialData: {[key: string]: string} = {};
    classStudents.forEach(student => {
      const existingAttendance = todayAttendance.find(a => a.studentId === student.id);
      initialData[student.id] = existingAttendance?.status || 'present';
    });

    setAttendanceData(initialData);
    setHasChanges(false);
  };

  const getClassOptions = () => {
    return [
      { id: 'class_1', name: 'Class 1A' },
      { id: 'class_2', name: 'Class 2B' },
      { id: 'class_3', name: 'Class 3C' },
    ];
  };

  const getClassStudents = () => {
    return students.filter(s => s.classId === selectedClass);
  };

  const updateAttendance = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status,
    }));
    setHasChanges(true);
  };

  const saveAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // TODO: Save to actual data store
      console.debug('Saving attendance for class:', selectedClass);
      console.debug('Attendance data:', attendanceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Attendance saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#28A745';
      case 'absent':
        return '#DC3545';
      case 'late':
        return '#FFC107';
      case 'excused':
        return '#6F42C1';
      default:
        return '#6C757D';
    }
  };

  const getStatusOptions = () => [
    { value: 'present', label: 'Present', color: '#28A745' },
    { value: 'absent', label: 'Absent', color: '#DC3545' },
    { value: 'late', label: 'Late', color: '#FFC107' },
    { value: 'excused', label: 'Excused', color: '#6F42C1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Take Attendance</Text>
          <Text style={styles.subtitle}>
            {getClassOptions().find(c => c.id === selectedClass)?.name || 'Select Class'}
          </Text>
        </View>

        {/* Class Selector */}
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Class:</Text>
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

        {/* Status Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Status Legend:</Text>
          <View style={styles.legendItems}>
            {getStatusOptions().map((option) => (
              <View key={option.value} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: option.color }]} />
                <Text style={styles.legendText}>{option.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Student List */}
        <View style={styles.studentList}>
          <Text style={styles.listTitle}>Students ({getClassStudents().length})</Text>
          {getClassStudents().map((student) => (
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
              <View style={styles.statusButtons}>
                {getStatusOptions().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusButton,
                      attendanceData[student.id] === option.value && styles.selectedStatusButton,
                      { borderColor: option.color }
                    ]}
                    onPress={() => updateAttendance(student.id, option.value)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      attendanceData[student.id] === option.value && styles.selectedStatusButtonText,
                      { color: attendanceData[student.id] === option.value ? '#fff' : option.color }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryStats}>
            {getStatusOptions().map((option) => {
              const count = Object.values(attendanceData).filter(status => status === option.value).length;
              return (
                <View key={option.value} style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{count}</Text>
                  <Text style={styles.summaryLabel}>{option.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
            onPress={saveAttendance}
            disabled={!hasChanges}
          >
            <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={initializeAttendance}>
            <Text style={styles.resetButtonText}>Reset</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  legend: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 12,
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
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  selectedStatusButton: {
    backgroundColor: '#2F6FED',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedStatusButtonText: {
    color: '#fff',
  },
  summary: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F6FED',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2F6FED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F6FED',
  },
  resetButtonText: {
    color: '#2F6FED',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TakeAttendanceScreen;
