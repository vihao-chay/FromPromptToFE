# Mobile Application – Screen List & Screen Map

## Review 1 – MO

---

## 1. Overview

This document describes the list of screens (Screen List) and the navigation flow between screens (Screen Map) of the mobile application.  
The purpose of this document is to define the application structure and user navigation before UI mockup and implementation.

---

## 2. Screen List

The mobile application consists of authentication-related screens and main application screens.

### 2.1 Authentication Screens

| No  | Screen Name            | File Path                              | Description                              |
| --- | ---------------------- | -------------------------------------- | ---------------------------------------- |
| 1   | Home Screen            | `screens/HomeScreen.js`                | Pre-login home/welcome screen            |
| 2   | Login Screen           | `screens/auth/LoginScreen.js`          | Allows users to log into the application |
| 3   | Register Screen        | `screens/auth/RegisterScreen.js`       | Allows users to create a new account     |
| 4   | Forgot Password Screen | `screens/auth/ForgotPasswordScreen.js` | Allows users to recover their password   |

### 2.2 Main Application Screens

| No  | Screen Name      | File Path                              | Description                           |
| --- | ---------------- | -------------------------------------- | ------------------------------------- |
| 5   | Dashboard Screen | `screens/dashboard/DashboardScreen.js` | Main dashboard after successful login |

> Note: UI components such as buttons, headers, tab bars are implemented as reusable components and are not considered screens.

---

## 3. Screen Map

### 3.1 Authentication Flow

Home Screen
└── Login Screen
├── Register Screen
└── Forgot Password Screen

---

### 3.2 Main Application Flow

Login Success
↓
Dashboard Screen

---

### 3.3 Overall Application Navigation

The application uses a root navigator to control authentication and main application flows.

App Start
↓
RootNavigator
├── Unauthenticated User → AuthNavigator
│ ├── Home Screen
│ ├── Login Screen
│ │ ├── Register Screen
│ │ └── Forgot Password Screen
│
└── Authenticated User → MainNavigator
└── Dashboard Screen

---

## 4. Navigation Structure

- `RootNavigator` determines whether the user is authenticated.
- `AuthNavigator` manages authentication-related screens.
- `MainNavigator` manages main application screens after login.

---

## 5. Conclusion

The Screen List and Screen Map define the structure and navigation flow of the mobile application.  
This document serves as the foundation for mockup design and mobile implementation in the next development phases.
