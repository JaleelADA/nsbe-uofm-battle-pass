import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme, commonStyles } from '../styles/theme';
import { BADGES_CONFIG, TIER_DEFINITIONS } from '../utils/staticData';

const Badges = ({ userTier }) => {
  const getUserBadges = () => {
    if (!userTier) return [];
    
    const tierIndex = TIER_DEFINITIONS.findIndex(t => t.tier === userTier);
    if (tierIndex === -1) return [];
    
    // User earns all badges up to their tier level
    const earnedBadges = BADGES_CONFIG.slice(tierIndex);
    
    return BADGES_CONFIG.map(badge => ({
      ...badge,
      earned: earnedBadges.some(earned => earned.name === badge.name)
    }));
  };

  const renderBadge = (badge) => {
    const tierInfo = TIER_DEFINITIONS.find(t => t.tier === badge.name);
    const isEarned = badge.earned;
    
    return (
      <View 
        key={badge.name}
        style={[
          styles.badgeItem,
          { 
            borderColor: badge.border,
            opacity: isEarned ? 1 : 0.5,
            backgroundColor: isEarned ? badge.colors[0] + '20' : theme.colors.background,
          }
        ]}
      >
        <View style={styles.badgeIcon}>
          <Text style={styles.badgeEmoji}>
            {tierInfo ? tierInfo.icon : '🏅'}
          </Text>
        </View>
        
        <View style={styles.badgeInfo}>
          <Text style={[
            styles.badgeName,
            { color: isEarned ? badge.textColor : theme.colors.textSecondary }
          ]}>
            {badge.name}
          </Text>
          
          <Text style={styles.badgeDescription}>
            {tierInfo ? tierInfo.range : 'Achievement badge'}
          </Text>
          
          {isEarned && (
            <Text style={styles.earnedLabel}>✅ Earned</Text>
          )}
        </View>
      </View>
    );
  };

  const badgesWithStatus = getUserBadges();

  return (
    <View style={[commonStyles.section, styles.container]}>
      <Text style={[commonStyles.title, styles.title]}>
        🏆 Your Badges
      </Text>
      
      {!userTier ? (
        <View style={styles.emptyContainer}>
          <Text style={commonStyles.textSecondary}>
            Search for your name to see your earned badges!
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.badgesContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {badgesWithStatus.map(renderBadge)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  
  title: {
    textAlign: 'center',
    color: theme.colors.secondary,
  },
  
  badgesContainer: {
    flex: 1,
  },
  
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    ...theme.shadows.small,
  },
  
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  badgeEmoji: {
    fontSize: theme.fontSize.xl,
  },
  
  badgeInfo: {
    flex: 1,
  },
  
  badgeName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  
  badgeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  earnedLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});

export default Badges;