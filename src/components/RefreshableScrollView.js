import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useTheme } from '../state/theme';

/**
 * A component that wraps ScrollView with pull-to-refresh functionality
 * @param {function} onRefresh - Function to call when the user pulls to refresh
 * @param {boolean} refreshing - Whether the refresh indicator should be shown
 * @param {Object} props - All other props to pass to the ScrollView
 */
const RefreshableScrollView = ({ 
  onRefresh, 
  refreshing = false, 
  children, 
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.accent]} // Android
          tintColor={theme.accent} // iOS
          title="Yenileniyor..." // iOS
          titleColor={theme.text} // iOS
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView; 