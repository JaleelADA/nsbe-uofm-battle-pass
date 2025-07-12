import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, commonStyles } from '../styles/theme';
import { TIER_DEFINITIONS } from '../utils/staticData';

const UserStats = ({ userData, loading }) => {
  if (loading) {
    return (
      <View style={[commonStyles.section, styles.container]}>
        <Text style={commonStyles.text}>Loading user data...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[commonStyles.section, styles.container]}>
        <Text style={[commonStyles.title, styles.welcomeTitle]}>
          🏆 Welcome to NSBE Battle Pass
        </Text>
        <Text style={commonStyles.textSecondary}>
          Enter your name in the search to see your progress and rank!
        </Text>
      </View>
    );
  }

  const { name, score, tier, rank } = userData;
  const tierInfo = TIER_DEFINITIONS.find(t => t.tier === tier) || TIER_DEFINITIONS[3];

  return (
    <View style={[commonStyles.section, styles.container]}>
      <View style={styles.header}>
        <Text style={[commonStyles.title, styles.nameTitle]}>
          {name}
        </Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>XP Points</Text>
        </View>
        
        <View style={styles.tierContainer}>
          <Text style={styles.tierIcon}>{tierInfo.icon}</Text>
          <Text style={[styles.tierText, { color: tierInfo.color }]}>
            {tier}
          </Text>
          <Text style={styles.tierRange}>{tierInfo.range}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={commonStyles.textSecondary}>Tier Benefits:</Text>
        <Text style={styles.tierDescription}>{tierInfo.desc}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  welcomeTitle: {
    textAlign: 'center',
    color: theme.colors.secondary,
  },
  
  nameTitle: {
    flex: 1,
    color: theme.colors.secondary,
  },
  
  rankBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  
  rankText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.accent,
  },
  
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  tierContainer: {
    alignItems: 'center',
    flex: 1,
  },
  
  tierIcon: {
    fontSize: theme.fontSize.xxxl,
    marginBottom: theme.spacing.xs,
  },
  
  tierText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  
  tierRange: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  progressContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  tierDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
});

export default UserStats;