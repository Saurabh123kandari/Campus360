import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#2F6FED',
  onPress,
  accessibilityLabel,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || `${title}: ${value}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {icon && <Text style={styles.icon}>{icon}</Text>}
        </View>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    width: '48%',
    minHeight: 100,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    flex: 1,
    lineHeight: 16,
    marginRight: 4,
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
});

export default StatCard;
