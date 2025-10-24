import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../providers/DataProvider';
import AdminHeaderRight from '../../components/admin/AdminHeaderRight';
import PaymentRow from '../../components/admin/PaymentRow';
import { Payment } from '../../components/admin/PaymentRow';

const PaymentsScreen = () => {
  const { user } = useAuth();
  const { paymentsAdmin } = useData();
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptReference, setReceiptReference] = useState('');

  useEffect(() => {
    loadPayments();
  }, [paymentsAdmin, searchQuery, statusFilter]);

  const loadPayments = () => {
    let filtered = [...paymentsAdmin];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.parentName.toLowerCase().includes(query) ||
        p.studentName.toLowerCase().includes(query) ||
        p.reference?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleMarkReceived = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptReference('');
    setModalVisible(true);
  };

  const confirmMarkReceived = () => {
    if (!selectedPayment) return;

    // TODO: Update payment status in data store
    Alert.alert(
      'Payment Marked as Received',
      `Payment of ₹${selectedPayment.amount} from ${selectedPayment.parentName} has been marked as received.${receiptReference ? `\nReference: ${receiptReference}` : ''}`
    );
    
    setModalVisible(false);
    setSelectedPayment(null);
    setReceiptReference('');
  };

  const handleSendReminder = (payment: Payment) => {
    Alert.alert(
      'Reminder Sent',
      `Reminder sent to ${payment.parentName} for payment of ₹${payment.amount}`
    );
  };

  const handleViewHistory = (payment: Payment) => {
    Alert.alert(
      'Payment History',
      `Payment history for ${payment.studentName}:\n\n• Previous payments: 3\n• Total paid: ₹4,500\n• Last payment: ${payment.dueDate}\n• Payment method: Bank Transfer`
    );
  };

  const getStatusCounts = () => {
    const counts = {
      all: paymentsAdmin.length,
      due: paymentsAdmin.filter(p => p.status === 'due').length,
      paid: paymentsAdmin.filter(p => p.status === 'paid').length,
      overdue: paymentsAdmin.filter(p => p.status === 'overdue').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

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

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by parent name, student name, or reference..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search payments"
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {[
              { key: 'all', label: `All (${statusCounts.all})` },
              { key: 'due', label: `Due (${statusCounts.due})` },
              { key: 'paid', label: `Paid (${statusCounts.paid})` },
              { key: 'overdue', label: `Overdue (${statusCounts.overdue})` },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  statusFilter === filter.key && styles.activeFilterButton
                ]}
                onPress={() => setStatusFilter(filter.key)}
                accessibilityLabel={`Filter by ${filter.label}`}
              >
                <Text style={[
                  styles.filterButtonText,
                  statusFilter === filter.key && styles.activeFilterButtonText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payments List */}
        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>
            Payments ({filteredPayments.length})
          </Text>
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onMarkReceived={handleMarkReceived}
                onSendReminder={handleSendReminder}
                onViewHistory={handleViewHistory}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💳</Text>
              <Text style={styles.emptyStateTitle}>No Payments Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No payment records available'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mark as Received Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark Payment as Received</Text>
            {selectedPayment && (
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentDetailText}>
                  Student: {selectedPayment.studentName}
                </Text>
                <Text style={styles.paymentDetailText}>
                  Parent: {selectedPayment.parentName}
                </Text>
                <Text style={styles.paymentDetailText}>
                  Amount: ₹{selectedPayment.amount.toLocaleString()}
                </Text>
                <Text style={styles.paymentDetailText}>
                  Due Date: {new Date(selectedPayment.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            <TextInput
              style={styles.receiptInput}
              placeholder="Receipt reference (optional)"
              value={receiptReference}
              onChangeText={setReceiptReference}
              accessibilityLabel="Receipt reference"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmMarkReceived}
              >
                <Text style={styles.confirmButtonText}>Mark Received</Text>
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
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#2F6FED',
    borderColor: '#2F6FED',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  paymentsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  receiptInput: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#28A745',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentsScreen;
