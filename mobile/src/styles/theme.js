export const theme = {
  colors: {
    primary: '#4CAF50',        // NSBE Green
    secondary: '#FFD700',      // NSBE Gold
    accent: '#2196F3',         // NSBE Blue
    background: '#0D1117',     // Dark Background
    surface: '#161B22',        // Dark Gray
    border: '#30363D',         // Border Gray
    text: '#FFFFFF',           // White text
    textSecondary: '#8B949E',  // Gray text
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    neonGlow: '#00FFAB',
    cyberBlue: '#00D4FF',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    }
  }
};

export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  subtitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  
  textSecondary: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
};