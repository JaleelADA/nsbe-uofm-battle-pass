import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { theme, commonStyles } from '../styles/theme';
import { fetchTopLeaderboard, searchUser } from '../services/googleSheetsService';
import { TIER_DEFINITIONS } from '../utils/staticData';

const Leaderboard = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showTopOnly, setShowTopOnly] = useState(true);

  useEffect(() => {
    loadTopLeaderboard();
  }, []);

  const loadTopLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await fetchTopLeaderboard(10);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowTopOnly(true);
      return;
    }

    try {
      setSearching(true);
      setShowTopOnly(false);
      const results = await searchUser(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const getTierInfo = (tier) => {
    return TIER_DEFINITIONS.find(t => t.tier === tier) || TIER_DEFINITIONS[3];
  };

  const isCurrentUser = (name) => {
    return currentUser && currentUser.name.toLowerCase() === name.toLowerCase();
  };

  const renderLeaderboardItem = (item, index) => {
    const tierInfo = getTierInfo(item.tier);
    const isHighlighted = isCurrentUser(item.name);
    
    return (
      <View
        key={`${item.name}-${index}`}
        style={[
          styles.leaderboardItem,
          isHighlighted && styles.highlightedItem
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isHighlighted && styles.highlightedText]}>
            #{item.rank}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isHighlighted && styles.highlightedText]}>
            {item.name}
          </Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierIcon}>{tierInfo.icon}</Text>
            <Text style={styles.tierName}>{item.tier}</Text>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, isHighlighted && styles.highlightedText]}>
            {item.score}
          </Text>
          <Text style={styles.scoreLabel}>XP</Text>
        </View>
      </View>
    );
  };

  const displayData = showTopOnly ? leaderboardData : searchResults;

  return (
    <View style={[commonStyles.section, styles.container]}>
      <Text style={[commonStyles.title, styles.title]}>
        🏆 Leaderboard
      </Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[commonStyles.input, styles.searchInput]}
          placeholder="Search for any user..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searching && (
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary} 
            style={styles.searchSpinner}
          />
        )}
      </View>

      {searchQuery && !showTopOnly && (
        <TouchableOpacity
          style={styles.showTopButton}
          onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
            setShowTopOnly(true);
          }}
        >
          <Text style={styles.showTopButtonText}>Show Top 10</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[commonStyles.textSecondary, styles.loadingText]}>
              Loading leaderboard...
            </Text>
          </View>
        ) : displayData.length > 0 ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>Rank</Text>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Score</Text>
            </View>
            {displayData.map((item, index) => renderLeaderboardItem(item, index))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={commonStyles.textSecondary}>
              {searchQuery ? 'No users found matching your search.' : 'No leaderboard data available.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  
  title: {
    textAlign: 'center',
    color: theme.colors.secondary,
  },
  
  searchContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  
  searchInput: {
    paddingRight: theme.spacing.xl,
  },
  
  searchSpinner: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    marginTop: -10,
  },
  
  showTopButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  
  showTopButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  
  leaderboardContainer: {
    flex: 1,
  },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  
  headerText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  highlightedItem: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  
  rankContainer: {
    width: 60,
    alignItems: 'center',
  },
  
  rankText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  highlightedText: {
    color: theme.colors.primary,
  },
  
  userInfo: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  tierIcon: {
    fontSize: theme.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  
  tierName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  
  scoreContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  
  scoreText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  
  scoreLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  loadingText: {
    marginTop: theme.spacing.md,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});

export default Leaderboard;