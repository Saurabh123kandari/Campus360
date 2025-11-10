import React, { useMemo, useState } from 'react';
import {
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  ScrollView,
} from 'react-native';

export interface DropdownSelectOption {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  label?: string;
  value?: string;
  options: DropdownSelectOption[];
  placeholder?: string;
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  options,
  placeholder = 'Select an option',
  onSelect,
  error,
  disabled = false,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleOpen = () => {
    if (!disabled) {
      setVisible(true);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleSelect = (option: DropdownSelectOption) => {
    onSelect(option.value);
    setVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          error && styles.selectorError,
        ]}
        activeOpacity={0.7}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.caret}>▾</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {label ? `Select ${label.replace(/\s*\*/g, '')}` : 'Select Option'}
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.optionsContainer}>
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                        onPress={() => handleSelect(option)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorError: {
    borderColor: '#dc3545',
  },
  selectorDisabled: {
    backgroundColor: '#f1f3f5',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#adb5bd',
  },
  caret: {
    fontSize: 18,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowSelected: {
    backgroundColor: '#e8f0ff',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: '#2F6FED',
  },
  checkmark: {
    fontSize: 16,
    color: '#2F6FED',
    fontWeight: '600',
  },
});

export default DropdownSelect;


