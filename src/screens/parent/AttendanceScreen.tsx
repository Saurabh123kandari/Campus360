import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';

const AttendanceScreen = () => {
  const { user } = useAuth();
  const { attendance } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAttendance, setMonthAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (user?.childId) {
      loadMonthAttendance();
    }
  }, [user, currentMonth]);

  const loadMonthAttendance = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get all days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find attendance record for this date
      const attendanceRecord = attendance.find(att => 
        att.studentId === user?.childId && att.date === dateString
      );
      
      monthData.push({
        date: dateString,
        day,
        status: attendanceRecord?.status || 'no-record',
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    
    setMonthAttendance(monthData);
    
    // Calculate summary
    const records = monthData.filter(day => day.status !== 'no-record' && !day.isWeekend);
    const present = records.filter(day => day.status === 'present').length;
    const absent = records.filter(day => day.status === 'absent').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    setSummary({ present, absent, total, percentage });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getStatusColor = (status: string, isWeekend: boolean) => {
    if (isWeekend) return '#E0E0E0';
    switch (status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'late': return '#FF9800';
      case 'holiday': return '#9C27B0';
      default: return '#F5F5F5';
    }
  };

  const getStatusText = (status: string, isWeekend: boolean) => {
    if (isWeekend) return 'Weekend';
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'holiday': return 'Holiday';
      default: return 'No Record';
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSubtitle}>
          {formatMonthYear(currentMonth)}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.present}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.absent}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.percentage}%</Text>
            <Text style={styles.summaryLabel}>Attendance</Text>
          </View>
        </View>
      </View>

      {/* Month Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer}>
        <View style={styles.weekDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {monthAttendance.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <View style={[
                styles.dayBox,
                { backgroundColor: getStatusColor(day.status, day.isWeekend) }
              ]}>
                <Text style={[
                  styles.dayNumber,
                  { color: day.isWeekend ? '#999' : '#333' }
                ]}>
                  {day.day}
                </Text>
                <Text style={[
                  styles.dayStatus,
                  { color: day.isWeekend ? '#999' : '#333' }
                ]}>
                  {getStatusText(day.status, day.isWeekend)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.legendText}>Holiday</Text>
          </View>
        </View>
      </View>
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayBox: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  dayStatus: {
    fontSize: 10,
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
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
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default AttendanceScreen;
