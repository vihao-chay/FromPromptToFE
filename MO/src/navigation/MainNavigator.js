import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingCheckScreen from "../screens/onboarding/OnboardingCheckScreen";
import NewOrganizationScreen from "../screens/onboarding/NewOrganizationScreen";
import NewProjectScreen from "../screens/onboarding/NewProjectScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ProjectLogsScreen from "../screens/project/ProjectLogsScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="OnboardingCheck" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingCheck" component={OnboardingCheckScreen} />
      <Stack.Screen name="NewOrganization" component={NewOrganizationScreen} />
      <Stack.Screen name="NewProject" component={NewProjectScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ProjectLogs" component={ProjectLogsScreen} />
    </Stack.Navigator>
  );
}
