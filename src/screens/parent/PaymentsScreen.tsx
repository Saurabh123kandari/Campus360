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
  TextInput,
  Modal,
} from 'react-native';
import { Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import ProfileIcon from '../../components/ProfileIcon';

interface Payment {
  id: string;
  parentId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidOn?: string;
  reference?: string;
}

interface PaymentSummary {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
}

const PaymentsScreen = () => {
  const { user } = useAuth();
  const { payments } = useData();
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reference, setReference] = useState('');
  const [paidDate, setPaidDate] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter payments for current user
      const filteredPayments = payments.filter(p => p.parentId === user?.id);
      setUserPayments(filteredPayments);

      // Calculate summary
      const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      const pending = filteredPayments.filter(p => p.status === 'pending').length;
      const paid = filteredPayments.filter(p => p.status === 'paid').length;
      const overdue = filteredPayments.filter(p => p.status === 'overdue').length;

      setSummary({ total, pending, paid, overdue });
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return '#28A745';
    if (status === 'overdue') return '#DC3545';
    if (status === 'pending') return '#FFC107';
    return '#6C757D';
  };

  const getStatusText = (status: string, dueDate: string) => {
    if (status === 'paid') return 'Paid';
    if (status === 'overdue') return 'Overdue';
    if (status === 'pending') return 'Due';
    return 'Unknown';
  };

  const handlePayAtSchoolPortal = () => {
    const url = 'https://school-portal.demo';
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open school portal');
    });
  };

  const handleMarkAsPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setReference('');
    setPaidDate(new Date().toISOString().split('T')[0]);
    setShowMarkPaidModal(true);
  };

  const confirmMarkAsPaid = () => {
    if (!selectedPayment || !reference.trim()) {
      Alert.alert('Error', 'Please enter a reference number');
      return;
    }

    // Update payment in memory
    const updatedPayments = userPayments.map(p => 
      p.id === selectedPayment.id 
        ? { 
            ...p, 
            status: 'paid' as const, 
            paidOn: paidDate, 
            reference: reference.trim() 
          }
        : p
    );
    
    setUserPayments(updatedPayments);
    setShowMarkPaidModal(false);
    setSelectedPayment(null);
    setReference('');
    setPaidDate('');

    // Recalculate summary
    const total = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pending = updatedPayments.filter(p => p.status === 'pending').length;
    const paid = updatedPayments.filter(p => p.status === 'paid').length;
    const overdue = updatedPayments.filter(p => p.status === 'overdue').length;

    setSummary({ total, pending, paid, overdue });

    Alert.alert('Success', 'Payment marked as paid successfully!');
  };

  const cancelMarkAsPaid = () => {
    setShowMarkPaidModal(false);
    setSelectedPayment(null);
    setReference('');
    setPaidDate('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6FED" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>💳 Payments</Text>
            <Text style={styles.headerSubtitle}>
              Manage your school payments
            </Text>
          </View>
          <ProfileIcon />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{formatCurrency(summary.total)}</Text>
            <Text style={styles.summaryLabel}>Total Amount</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.paid}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
        </View>
        
        {/* Overdue Alert */}
        {summary.overdue > 0 && (
          <View style={styles.overdueAlert}>
            <Text style={styles.overdueIcon}>⚠️</Text>
            <Text style={styles.overdueText}>
              You have {summary.overdue} overdue payment{summary.overdue > 1 ? 's' : ''}. Please pay immediately to avoid additional charges.
            </Text>
          </View>
        )}

        {/* Primary Action */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={handlePayAtSchoolPortal}
        >
          <Text style={styles.primaryActionIcon}>🏫</Text>
          <Text style={styles.primaryActionText}>Pay at School Portal</Text>
        </TouchableOpacity>

        {/* Payments List */}
        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {userPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No Payments</Text>
              <Text style={styles.emptySubtitle}>
                No payment records found.
              </Text>
            </View>
          ) : (
            userPayments
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
              .map((payment) => (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(payment.status, payment.dueDate) }
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(payment.status, payment.dueDate)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.paymentDescription}>
                    {payment.description}
                  </Text>

                  <View style={styles.paymentDetails}>
                    <View style={styles.paymentDetail}>
                      <Text style={styles.paymentDetailIcon}>📅</Text>
                      <Text style={styles.paymentDetailText}>
                        Due: {formatDate(payment.dueDate)}
                      </Text>
                    </View>
                    
                    {payment.status === 'paid' && payment.paidOn && (
                      <View style={styles.paymentDetail}>
                        <Text style={styles.paymentDetailIcon}>✅</Text>
                        <Text style={styles.paymentDetailText}>
                          Paid: {formatDate(payment.paidOn)}
                        </Text>
                      </View>
                    )}
                    
                    {payment.status === 'paid' && payment.reference && (
                      <View style={styles.paymentDetail}>
                        <Text style={styles.paymentDetailIcon}>🔢</Text>
                        <Text style={styles.paymentDetailText}>
                          Ref: {payment.reference}
                        </Text>
                      </View>
                    )}
                  </View>

                  {(payment.status === 'pending' || payment.status === 'overdue') && (
                    <TouchableOpacity
                      style={styles.markPaidButton}
                      onPress={() => handleMarkAsPaid(payment)}
                    >
                      <Text style={styles.markPaidButtonText}>
                        Mark as Paid (I paid)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Payment Information</Text>
          <Text style={styles.helpText}>
            • Payments are processed through the school portal
          </Text>
          <Text style={styles.helpText}>
            • You can mark payments as paid if you've paid directly
          </Text>
          <Text style={styles.helpText}>
            • Contact the school office for payment assistance
          </Text>
        </View>
      </ScrollView>

      {/* Mark as Paid Modal */}
      <Modal
        visible={showMarkPaidModal}
        transparent
        animationType="slide"
        onRequestClose={cancelMarkAsPaid}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark as Paid</Text>
            <Text style={styles.modalSubtitle}>
              Enter payment details for {selectedPayment?.description}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reference Number *</Text>
              <TextInput
                style={styles.textInput}
                value={reference}
                onChangeText={setReference}
                placeholder="Enter payment reference"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Payment Date *</Text>
              <TextInput
                style={styles.textInput}
                value={paidDate}
                onChangeText={setPaidDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelMarkAsPaid}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmMarkAsPaid}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B3D4FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F6FED',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  overdueAlert: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  overdueText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
  },
  primaryActionButton: {
    backgroundColor: '#2F6FED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentDetailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 16,
  },
  paymentDetailText: {
    fontSize: 14,
    color: '#666',
  },
  markPaidButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  markPaidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
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
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2F6FED',
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentsScreen;