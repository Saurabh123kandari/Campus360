import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import TeacherHeaderRight from './TeacherHeaderRight';

interface TeacherHeaderProps {
  user: {
    fullName?: string;
    name?: string;
  } | null;
  onProfilePress: () => void;
  showClassInfo?: boolean;
  classInfo?: string;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  user,
  onProfilePress,
  showClassInfo = false,
  classInfo,
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User';
  const fullName = user?.fullName || user?.name || 'User';

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer} accessibilityLabel="Kilbil High School logo">
          <Image
            source={require('../../assets/images/kilbil-logo.png')}
            style={[styles.logo, isSmallScreen && styles.logoSmall]}
            resizeMode="contain"
            accessibilityLabel="Kilbil High School logo"
          />
          <Text style={[styles.logoText, isSmallScreen && styles.logoTextSmall]}>
            KILBIL HIGH SCHOOL
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text
            style={[styles.welcomeText, isSmallScreen && styles.welcomeTextSmall]}
            accessibilityLabel={`Welcome, ${firstName}`}
          >
            Welcome back, {firstName}
          </Text>
          <TeacherHeaderRight onPress={onProfilePress} />
        </View>
      </View>
      <View style={styles.teacherInfo}>
        <Text
          style={styles.teacherAvatar}
          accessibilityLabel="Teacher avatar"
          accessibilityRole="image"
        >
          👩‍🏫
        </Text>
        <View style={styles.teacherDetails}>
          <Text
            style={[styles.teacherName, isSmallScreen && styles.teacherNameSmall]}
            accessibilityLabel={`Teacher name: ${fullName}`}
          >
            {fullName}
          </Text>
          <Text
            style={[styles.teacherRole, isSmallScreen && styles.teacherRoleSmall]}
            accessibilityLabel="Role: Teacher"
          >
            Teacher
          </Text>
        </View>
      </View>
      {showClassInfo && classInfo && (
        <View style={styles.classInfo} accessibilityLabel={`Class information: ${classInfo}`}>
          <Text style={[styles.classInfoText, isSmallScreen && styles.classInfoTextSmall]}>
            {classInfo}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2F6FED',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 140,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    maxWidth: '70%',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  logoSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    lineHeight: 22,
    flexShrink: 1,
  },
  logoTextSmall: {
    fontSize: 16,
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  welcomeTextSmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
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
  teacherNameSmall: {
    fontSize: 16,
  },
  teacherRole: {
    fontSize: 14,
    color: '#B3D4FF',
  },
  teacherRoleSmall: {
    fontSize: 12,
  },
  classInfo: {
    marginTop: 12,
  },
  classInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  classInfoTextSmall: {
    fontSize: 14,
  },
});

export default TeacherHeader;

