import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import { theme, commonStyles } from './styles/theme';
import { getUserData } from './services/googleSheetsService';
import UserStats from './components/UserStats';
import Leaderboard from './components/Leaderboard';
import Events from './components/Events';
import Announcements from './components/Announcements';
import Badges from './components/Badges';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUserSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a name to search');
      return;
    }

    try {
      setLoading(true);
      const user = await getUserData(searchQuery.trim());
      
      if (user) {
        setUserData(user);
        Alert.alert('Success', `Found ${user.name}! Rank #${user.rank}`);
      } else {
        setUserData(null);
        Alert.alert('Not Found', 'User not found in the leaderboard. Please check the spelling and try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for user. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setUserData(null);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.background} 
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NSBE Battle Pass</Text>
          <Text style={styles.headerSubtitle}>University of Michigan</Text>
        </View>

        {/* User Search */}
        <View style={[commonStyles.section, styles.searchSection]}>
          <Text style={styles.searchLabel}>🔍 Find Your Progress</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={[commonStyles.input, styles.searchInput]}
              placeholder="Enter your full name..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleUserSearch}
              returnKeyType="search"
              autoCapitalize="words"
            />
            
            <View style={styles.searchButtons}>
              <TouchableOpacity
                style={[commonStyles.button, styles.searchButton]}
                onPress={handleUserSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                ) : (
                  <Text style={commonStyles.buttonText}>Search</Text>
                )}
              </TouchableOpacity>
              
              {userData && (
                <TouchableOpacity
                  style={[styles.clearButton]}
                  onPress={clearSearch}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* User Stats */}
        <UserStats userData={userData} loading={loading} />

        {/* Badges */}
        <Badges userTier={userData?.tier} />

        {/* Events */}
        <Events />

        {/* Announcements */}
        <Announcements />

        {/* Leaderboard */}
        <Leaderboard currentUser={userData} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with ❤️ for NSBE UofM
          </Text>
          <Text style={styles.footerSubtext}>
            Empowering Excellence Through Technology
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  
  searchSection: {
    marginTop: 0,
  },
  
  searchLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  
  searchContainer: {
    gap: theme.spacing.md,
  },
  
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  
  searchButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  
  searchButton: {
    minWidth: 100,
  },
  
  clearButton: {
    backgroundColor: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  clearButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  footerSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default App;