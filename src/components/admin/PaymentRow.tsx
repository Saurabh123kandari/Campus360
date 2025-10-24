import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface Payment {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'paid' | 'overdue';
  paidOn?: string;
  reference?: string;
  reminders: number;
}

export interface PaymentRowProps {
  payment: Payment;
  onMarkReceived: (payment: Payment) => void;
  onSendReminder: (payment: Payment) => void;
  onViewHistory: (payment: Payment) => void;
}

const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  onMarkReceived,
  onSendReminder,
  onViewHistory,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#28A745';
      case 'overdue':
        return '#DC3545';
      case 'due':
        return '#FFC107';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'due':
        return 'Due';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {payment.studentName.charAt(0)}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.studentName}>{payment.studentName}</Text>
            <Text style={styles.parentName}>{payment.parentName}</Text>
            <Text style={styles.dueDate}>
              Due: {formatDate(payment.dueDate)}
            </Text>
          </View>
        </View>
        
        <View style={styles.amountInfo}>
          <Text style={styles.amount}>{formatAmount(payment.amount)}</Text>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(payment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(payment.status)}</Text>
          </View>
          {payment.reference && (
            <Text style={styles.reference}>Ref: {payment.reference}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {payment.status === 'due' || payment.status === 'overdue' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => onMarkReceived(payment)}
            accessibilityLabel={`Mark payment as received for ${payment.studentName}`}
          >
            <Text style={styles.primaryButtonText}>Mark Received</Text>
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => onSendReminder(payment)}
          accessibilityLabel={`Send reminder for ${payment.studentName}'s payment`}
        >
          <Text style={styles.secondaryButtonText}>
            Remind {payment.reminders > 0 && `(${payment.reminders})`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryButton]}
          onPress={() => onViewHistory(payment)}
          accessibilityLabel={`View payment history for ${payment.studentName}`}
        >
          <Text style={styles.tertiaryButtonText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F6FED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  parentName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reference: {
    fontSize: 10,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#28A745',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#FFC107',
  },
  tertiaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PaymentRow;
