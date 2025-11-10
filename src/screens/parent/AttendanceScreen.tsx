import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import ProfileIcon from '../../components/ProfileIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  AttendanceHistoryEntryApi,
  AttendanceStatusApi,
  StudentApi,
} from '../../types/students';
import { useGetStudentsByParentIdMutation } from '../../store/services/studentsApi';
import { useGetAttendanceHistoryMutation } from '../../store/services/attendanceApi';
import { RootState } from '../../store';

type AttendanceStatus = AttendanceStatusApi;

type AttendanceHistoryEntry = AttendanceHistoryEntryApi & {
  localDate: string;
  status: AttendanceStatus;
};

interface CalendarDay {
  day: number;
  date: string;
  status: AttendanceStatus;
}

interface MonthlyStats {
  present: number;
  absent: number;
  holiday: number;
  notMarked: number;
  percentage: number;
}

const formatDateKey = (value: string) => value.split('T')[0] ?? value;

const normalizeAttendanceStatus = (status: string): AttendanceStatus => {
  const normalized = status?.toLowerCase().trim();
  switch (normalized) {
    case 'present':
      return 'present';
    case 'absent':
      return 'absent';
    case 'holiday':
      return 'holiday';
    case 'not_marked':
    case 'not marked':
    case 'pending':
      return 'not_marked';
    default:
      return 'not_marked';
  }
};

const formatDisplayDate = (value: string) => {
  const dateKey = formatDateKey(value);
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return '#28A745';
    case 'absent':
      return '#DC3545';
    case 'holiday':
      return '#FFC107';
    case 'not_marked':
      return '#6C757D';
    default:
      return '#6C757D';
  }
};

const getStatusIcon = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return '✅';
    case 'absent':
      return '❌';
    case 'holiday':
      return '🎉';
    case 'not_marked':
      return '❓';
    default:
      return '❔';
  }
};

const formatStatusLabel = (status: AttendanceStatus) => {
  if (status === 'not_marked') {
    return 'Not Marked';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStudentDisplayName = (student: StudentApi) => {
  const parts = [student.firstName, student.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : student.registrationNo || 'Student';
};

const normalizeStudentId = (student: StudentApi & { _id?: string }) => ({
  ...student,
  id: student.id ?? student._id ?? '',
});

const AttendanceScreen = () => {
  const { user } = useAuth();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const parentId = (reduxUser as any)?.id ?? user?.id ?? null;
  const showToastRef = useRef(showToast);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [students, setStudents] = useState<StudentApi[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentApi | null>(null);
  const [studentPickerVisible, setStudentPickerVisible] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    present: 0,
    absent: 0,
    holiday: 0,
    notMarked: 0,
    percentage: 0,
  });
  const [getStudentsByParentId, { isLoading: studentsLoading }] =
    useGetStudentsByParentIdMutation();
  const [getAttendanceHistoryApi, { isLoading: attendanceLoading }] =
    useGetAttendanceHistoryMutation();

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const loadStudents = useCallback(async () => {
    console.log('loadStudents asdasdsa', parentId);
    if (!parentId) {
      return;
    }

    try {
      const response = await getStudentsByParentId({ parentId }).unwrap();
      if (response.success && response.data?.students) {
        const fetchedStudents = response.data.students;
        const normalizedStudents = fetchedStudents
          .map(normalizeStudentId)
          .filter((student) => student.id);
        setStudents(normalizedStudents);
        console.log('apiStudents', JSON.stringify(fetchedStudents, null, 2));
        if (normalizedStudents.length === 0) {
          setSelectedStudent(null);
        } else {
          setSelectedStudent((prev) => {
            if (prev) {
              const stillExists = normalizedStudents.find((student) => student.id === prev.id);
              if (stillExists) {
                return stillExists;
              }
            }
            return normalizedStudents[0];
          });
        }
      } else {
        setStudents([]);
        setSelectedStudent(null);
        if (response.message) {
          showToastRef.current?.(response.message, 'info');
        }
      }
    } catch (error) {
      console.error('Error fetching parent students:', error);
      showToastRef.current?.('Failed to load students. Please try again.', 'error');
    }
  }, [parentId, getStudentsByParentId]);

  const fetchAttendance = useCallback(async (studentId: string) => {
    console.log('fetchAttendance', studentId);
    try {
      const response = await getAttendanceHistoryApi({ studentId }).unwrap();
      if (response.success && response.data?.history) {
        const normalizedHistory: AttendanceHistoryEntry[] = response.data.history.map((entry) => ({
          ...entry,
          localDate: formatDateKey(entry.date),
          status: normalizeAttendanceStatus(entry.status),
        }));
        console.log('normalizedHistory', normalizedHistory);
        setAttendanceHistory(normalizedHistory);
      } else {
        setAttendanceHistory([]);
        if (response.message) {
          showToastRef.current?.(response.message, 'info');
        }
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
      showToastRef.current?.('Failed to load attendance history. Please try again.', 'error');
    }
  }, [getAttendanceHistoryApi]);

  useEffect(() => {
    console.log('parentId', parentId);
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (selectedStudent?.id) {
      fetchAttendance(selectedStudent.id);
    } else {
      setAttendanceHistory([]);
    }
  }, [selectedStudent, fetchAttendance]);

  const monthlyEntries = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    return attendanceHistory.filter((entry) => {
      const [entryYear, entryMonth] = entry.localDate
        .split('-')
        .map((value) => Number(value));
      return entryYear === year && entryMonth === month;
    });
  }, [attendanceHistory, currentMonth]);

  useEffect(() => {
    const present = monthlyEntries.filter((entry) => entry.status === 'present').length;
    const absent = monthlyEntries.filter((entry) => entry.status === 'absent').length;
    const holiday = monthlyEntries.filter((entry) => entry.status === 'holiday').length;
    const notMarked = monthlyEntries.filter((entry) => entry.status === 'not_marked').length;
    const attendedDays = present + absent;
    const percentage = attendedDays > 0 ? Math.round((present / attendedDays) * 100) : 0;

    setMonthlyStats({
      present,
      absent,
      holiday,
      notMarked,
      percentage,
    });
  }, [monthlyEntries]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    const monthlyMap = monthlyEntries.reduce<Record<string, AttendanceStatus>>((acc, entry) => {
      acc[entry.localDate] = entry.status;
      return acc;
    }, {});

    const days: Array<CalendarDay | null> = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayStr}`;
      const status = monthlyMap[dateKey] ?? 'not_marked';

      days.push({
        day,
        date: dateKey,
        status,
      });
    }

    return days;
  }, [currentMonth, monthlyEntries]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const updated = new Date(currentMonth);
    if (direction === 'prev') {
      updated.setMonth(updated.getMonth() - 1);
    } else {
      updated.setMonth(updated.getMonth() + 1);
    }
    setCurrentMonth(updated);
  };

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

  const handleDayPress = (day: CalendarDay | null) => {
    if (!day) {
      return;
    }

    const displayDate = formatDisplayDate(day.date);
    switch (day.status) {
      case 'present':
        showToast(`Present on ${displayDate}`, 'success');
        break;
      case 'absent':
        showToast(`Absent on ${displayDate}`, 'error');
        break;
      case 'holiday':
        showToast(`Holiday on ${displayDate}`, 'info');
        break;
      case 'not_marked':
      default:
        showToast(`Attendance not marked on ${displayDate}`, 'info');
        break;
    }
  };

  const openStudentPicker = () => {
    if (!students.length && !studentsLoading) {
      loadStudents();
    }
    setStudentPickerVisible(true);
  };

  const handleStudentSelect = (student: StudentApi) => {
    setSelectedStudent(student);
    setStudentPickerVisible(false);
    setCurrentMonth(new Date());
  };

  const recentMonthlyRecords = useMemo(() => {
    return [...monthlyEntries]
      .sort(
        (a, b) =>
          new Date(`${b.localDate}T00:00:00`).getTime() -
          new Date(`${a.localDate}T00:00:00`).getTime()
      )
      .slice(0, 5);
  }, [monthlyEntries]);

  const renderStudentItem = ({ item }: { item: StudentApi }) => {
    const isSelected = selectedStudent?.id === item.id;
    const classLabel = item.class || '';
    const sectionLabel = item.section ? ` - ${item.section}` : '';

    return (
      <TouchableOpacity
        style={[styles.studentItem, isSelected && styles.studentItemSelected]}
        onPress={() => handleStudentSelect(item)}
        activeOpacity={0.8}
      >
        <View>
          <Text style={styles.studentName}>{getStudentDisplayName(item)}</Text>
          {(classLabel || sectionLabel) && (
            <Text style={styles.studentDetails}>
              Class {classLabel}
              {sectionLabel}
            </Text>
          )}
        </View>
        {isSelected && <Text style={styles.studentSelectedIcon}>✓</Text>}
      </TouchableOpacity>
    );
  };

  const legendItems = [
    { label: 'Present', color: '#28A745' },
    { label: 'Absent', color: '#DC3545' },
    { label: 'Holiday', color: '#FFC107' },
    { label: 'Not Marked', color: '#6C757D' },
  ];

  const isInitialLoading = studentsLoading && !selectedStudent;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>📊 Attendance</Text>
            <TouchableOpacity
              style={styles.studentSelector}
              onPress={openStudentPicker}
              activeOpacity={0.8}
            >
              <Text style={styles.studentSelectorLabel}>
                {selectedStudent ? getStudentDisplayName(selectedStudent) : 'Select Student'}
              </Text>
              <Text style={styles.studentSelectorChevron}>⌄</Text>
            </TouchableOpacity>
            <Text style={styles.headerSubtitle}>{formatMonthYear(currentMonth)}</Text>
          </View>
          <ProfileIcon />
        </View>
      </View>

      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F6FED" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedStudent ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👨‍👧</Text>
              <Text style={styles.emptyStateTitle}>No students found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add a student or refresh to fetch your children’s records.
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={loadStudents}>
                <Text style={styles.refreshButtonText}>Refresh Students</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {attendanceLoading && (
                <View style={styles.inlineLoadingContainer}>
                  <ActivityIndicator size="small" color="#2F6FED" />
                  <Text style={styles.inlineLoadingText}>Fetching attendance...</Text>
                </View>
              )}

              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{monthlyStats.present}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{monthlyStats.absent}</Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{monthlyStats.percentage}%</Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
              </View>

              <View style={styles.monthNavigation}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateMonth('prev')}
                >
                  <Text style={styles.navButtonText}>← Previous</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateMonth('next')}
                >
                  <Text style={styles.navButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.calendarHeaderDay}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarDays.map((dayData, index) => (
                    <View key={`${dayData?.date ?? 'empty'}-${index}`} style={styles.calendarDay}>
                      {dayData ? (
                        <TouchableOpacity
                          style={styles.dayContainer}
                          onPress={() => handleDayPress(dayData)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.dayNumber}>{dayData.day}</Text>
                          <View
                            style={[
                              styles.statusIndicator,
                              { backgroundColor: getStatusColor(dayData.status) },
                            ]}
                          >

                            <Text style={styles.statusIcon}>{getStatusIcon(dayData.status)}</Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.emptyDay} />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>Legend</Text>
                <View style={styles.legendItems}>
                  {legendItems.map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                      <View
                        style={[styles.legendIndicator, { backgroundColor: item.color }]}
                      />
                      <Text style={styles.legendText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.recordsSection}>
                <Text style={styles.sectionTitle}>Recent Records</Text>
                {recentMonthlyRecords.length === 0 ? (
                  <View style={styles.noRecordsContainer}>
                    <Text style={styles.noRecordsText}>
                      No attendance entries recorded for this month yet.
                    </Text>
                  </View>
                ) : (
                  recentMonthlyRecords.map((record) => (
                    <View key={record.date} style={styles.recordItem}>
                      <View style={styles.recordDate}>
                        <Text style={styles.recordDateText}>
                          {formatDisplayDate(record.localDate)}
                        </Text>
                      </View>
                      <View style={styles.recordStatus}>
                        <Text style={styles.recordStatusIcon}>{getStatusIcon(record.status)}</Text>
                        <Text
                          style={[styles.recordStatusText, { color: getStatusColor(record.status) }]}
                        >
                          {formatStatusLabel(record.status)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

      <Modal
        transparent
        animationType="slide"
        visible={studentPickerVisible}
        onRequestClose={() => setStudentPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Student</Text>
              <TouchableOpacity
                onPress={() => setStudentPickerVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            {studentsLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#2F6FED" />
                <Text style={styles.modalLoadingText}>Loading students...</Text>
              </View>
            ) : students.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyIcon}>🧒</Text>
                <Text style={styles.modalEmptyText}>No students available</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadStudents}>
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={renderStudentItem}
                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                contentContainerStyle={styles.modalListContent}
              />
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
  header: {
    backgroundColor: '#2F6FED',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  studentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  studentSelectorLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  studentSelectorChevron: {
    color: '#fff',
    fontSize: 14,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B3D4FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inlineLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3ECFF',
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  inlineLoadingText: {
    color: '#2F6FED',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F6FED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  calendarHeaderDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 12,
  },
  emptyDay: {
    flex: 1,
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  legendIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  recordsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  noRecordsContainer: {
    padding: 16,
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
  },
  noRecordsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recordDate: {
    flex: 1,
  },
  recordDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recordStatusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  recordStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dee2e6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  modalCloseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalCloseText: {
    color: '#2F6FED',
    fontWeight: '600',
    fontSize: 14,
  },
  modalLoading: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  modalEmpty: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  modalEmptyIcon: {
    fontSize: 36,
  },
  modalEmptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  modalListContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e9ecef',
    marginVertical: 6,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  studentItemSelected: {
    backgroundColor: '#E4EDFF',
    borderWidth: 1,
    borderColor: '#2F6FED',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  studentDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  studentSelectedIcon: {
    fontSize: 18,
    color: '#2F6FED',
    fontWeight: '700',
  },
});

export default AttendanceScreen;
