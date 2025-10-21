import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';

const PaymentsScreen = () => {
  const { user } = useAuth();
  const { payments } = useData();
  const [childPayments, setChildPayments] = useState<any[]>([]);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paidDate, setPaidDate] = useState('');

  useEffect(() => {
    if (user?.childId && payments) {
      const filtered = payments.filter(payment => payment.studentId === user.childId);
      setChildPayments(filtered);
    }
  }, [user, payments]);

  const handlePayAtPortal = () => {
    const portalUrl = 'https://school-portal.demo';
    Linking.openURL(portalUrl).catch(err => {
      Alert.alert('Error', 'Could not open school portal');
    });
  };

  const handleMarkAsPaid = (payment: any) => {
    setSelectedPayment(payment);
    setShowMarkPaidModal(true);
  };

  const submitMarkAsPaid = () => {
    if (!paymentReference.trim()) {
      Alert.alert('Error', 'Please enter a payment reference');
      return;
    }

    // In a real app, this would update the backend
    // For demo, we'll just show a success message
    Alert.alert(
      'Success',
      `Payment marked as paid with reference: ${paymentReference}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowMarkPaidModal(false);
            setPaymentReference('');
            setPaidDate('');
            setSelectedPayment(null);
          }
        }
      ]
    );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getTotalDue = () => {
    return childPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getOverdueCount = () => {
    return childPayments.filter(p => p.status === 'overdue').length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>Manage your payments</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Due</Text>
          <Text style={styles.summaryAmount}>{formatAmount(getTotalDue())}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overdue</Text>
          <Text style={styles.summaryCount}>{getOverdueCount()}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePayAtPortal}>
          <Text style={styles.primaryButtonText}>Pay at School Portal</Text>
        </TouchableOpacity>
      </View>

      {/* Payments List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {childPayments.length > 0 ? (
          childPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentDescription}>{payment.description}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(payment.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(payment.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Amount:</Text>
                  <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                </View>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Due Date:</Text>
                  <Text style={styles.paymentDetailValue}>{formatDate(payment.dueDate)}</Text>
                </View>
                {payment.status === 'paid' && payment.paidOn && (
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Paid On:</Text>
                    <Text style={styles.paymentDetailValue}>{formatDate(payment.paidOn)}</Text>
                  </View>
                )}
                {payment.status === 'paid' && payment.reference && (
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Reference:</Text>
                    <Text style={styles.paymentDetailValue}>{payment.reference}</Text>
                  </View>
                )}
              </View>
              
              {payment.status !== 'paid' && (
                <TouchableOpacity
                  style={styles.markPaidButton}
                  onPress={() => handleMarkAsPaid(payment)}
                >
                  <Text style={styles.markPaidButtonText}>Mark as Paid (I paid)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💰</Text>
            <Text style={styles.emptyStateTitle}>No Payments</Text>
            <Text style={styles.emptyStateDescription}>
              No payment records found for this student.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Mark as Paid Modal */}
      <Modal
        visible={showMarkPaidModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMarkPaidModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark as Paid</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMarkPaidModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedPayment && (
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentInfoTitle}>{selectedPayment.description}</Text>
                  <Text style={styles.paymentInfoAmount}>
                    {formatAmount(selectedPayment.amount)}
                  </Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Payment Reference *</Text>
                <TextInput
                  style={styles.textInput}
                  value={paymentReference}
                  onChangeText={setPaymentReference}
                  placeholder="Enter transaction ID or reference"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Paid Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={paidDate}
                  onChangeText={setPaidDate}
                  placeholder="YYYY-MM-DD (optional)"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowMarkPaidModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitMarkAsPaid}
                >
                  <Text style={styles.submitButtonText}>Mark as Paid</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F6FED',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryButton: {
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  paymentDetails: {
    gap: 8,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDetailValue: {
    fontSize: 14,
    color: '#333',
  },
  markPaidButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  markPaidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentInfoAmount: {
    fontSize: 18,
    color: '#2F6FED',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentsScreen;
