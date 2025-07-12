import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme, commonStyles } from '../styles/theme';
import { EVENTS_DATA } from '../utils/staticData';

const Events = () => {
  const renderEventItem = (event) => (
    <View key={event.id} style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDate}>{event.date}</Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Text style={styles.eventDetailLabel}>⏰ Time:</Text>
          <Text style={styles.eventDetailValue}>{event.time}</Text>
        </View>
        
        <View style={styles.eventDetailRow}>
          <Text style={styles.eventDetailLabel}>📍 Location:</Text>
          <Text style={styles.eventDetailValue}>{event.location}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[commonStyles.section, styles.container]}>
      <Text style={[commonStyles.title, styles.title]}>
        📅 Upcoming Events
      </Text>
      
      <ScrollView 
        style={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {EVENTS_DATA.length > 0 ? (
          EVENTS_DATA.map(renderEventItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={commonStyles.textSecondary}>
              No upcoming events at this time.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  
  title: {
    textAlign: 'center',
    color: theme.colors.accent,
  },
  
  eventsContainer: {
    flex: 1,
  },
  
  eventItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  
  eventTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  
  eventDateBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  
  eventDate: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  eventDetails: {
    marginTop: theme.spacing.xs,
  },
  
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  eventDetailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    minWidth: 80,
  },
  
  eventDetailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});

export default Events;