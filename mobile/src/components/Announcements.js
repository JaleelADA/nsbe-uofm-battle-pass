import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Alert } from 'react-native';
import { theme, commonStyles } from '../styles/theme';
import { ANNOUNCEMENTS_DATA } from '../utils/staticData';

const Announcements = () => {
  const handleLinkPress = async (url, title) => {
    if (url === '#') {
      Alert.alert('Coming Soon', `${title} will be available soon!`);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const renderAnnouncementItem = (announcement) => (
    <TouchableOpacity
      key={announcement.id}
      style={styles.announcementItem}
      onPress={() => handleLinkPress(announcement.url, announcement.title)}
      activeOpacity={0.7}
    >
      <View style={styles.announcementContent}>
        <Text style={styles.announcementTitle}>{announcement.title}</Text>
        <Text style={styles.linkIndicator}>
          {announcement.url === '#' ? '🔗 Coming Soon' : '🔗 Open Link'}
        </Text>
      </View>
      <Text style={styles.arrowIcon}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[commonStyles.section, styles.container]}>
      <Text style={[commonStyles.title, styles.title]}>
        📢 Announcements
      </Text>
      
      <ScrollView 
        style={styles.announcementsContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {ANNOUNCEMENTS_DATA.length > 0 ? (
          ANNOUNCEMENTS_DATA.map(renderAnnouncementItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={commonStyles.textSecondary}>
              No announcements at this time.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 250,
  },
  
  title: {
    textAlign: 'center',
    color: theme.colors.secondary,
  },
  
  announcementsContainer: {
    flex: 1,
  },
  
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  
  announcementContent: {
    flex: 1,
  },
  
  announcementTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  linkIndicator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  
  arrowIcon: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});

export default Announcements;