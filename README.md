# Patient App

A comprehensive React Native mobile application for patients to connect with healthcare professionals, book appointments, manage schedules, and access various healthcare services.

## Overview

Patient App is a full-featured healthcare application that enables patients to:
- Register and manage their personal information
- Browse and book appointments with therapists/experts
- Engage in real-time chat and video consultations
- Manage appointments and schedules
- Handle payments and wallet transactions
- Receive push notifications
- Review and rate healthcare providers

## Features

### Authentication
- User registration with phone number verification
- OTP-based authentication
- Password reset functionality
- Personal information management
- Terms & Conditions and Privacy Policy

### Core Functionality
- **Home Screen**: Browse available therapists and services
- **Therapist Booking**: Search, filter, and book appointments with healthcare experts
- **Schedule Management**: View and manage upcoming appointments
- **Real-time Chat**: Communicate with therapists via in-app messaging
- **Video Consultations**: Integrated video calling using Agora SDK
- **Wallet**: Manage payments and transactions
- **Notifications**: Push notifications for appointments and updates
- **Profile Management**: Update personal information and preferences
- **Bookmarks**: Save favorite therapists for quick access
- **Reviews**: Rate and review healthcare providers

### Technical Features
- Offline support with network status detection
- Firebase integration for backend services
- Payment gateway integration (Razorpay)
- File sharing and document management
- Responsive design for various screen sizes
- Cross-platform support (iOS and Android)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **React Native CLI**
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS dependencies)
- **Java Development Kit (JDK)**

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd PatientApp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. iOS Setup

Navigate to the iOS directory and install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
API_URL=your_api_url_here
```

### 5. Firebase Configuration

#### Android
- Place your `google-services.json` file in `android/app/`

#### iOS
- Place your `GoogleService-Info.plist` file in `ios/PatientApp/`

## Running the Application

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

### Run on iOS

```bash
npm run ios
# or
yarn ios
```

## Project Structure

```
PatientApp/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── assets/             # Images, fonts, and other assets
│   ├── components/         # Reusable UI components
│   ├── context/           # React Context providers
│   ├── model/             # Data models
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── AuthScreen/   # Authentication screens
│   │   └── NoAuthScreen/ # Main app screens
│   ├── store/             # Redux store configuration
│   └── utils/             # Utility functions and services
├── App.js                 # Main application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Key Dependencies

### Core
- React Native 0.72.4
- React 18.2.0
- React Navigation 6.x
- Redux Toolkit

### Firebase
- @react-native-firebase/app
- @react-native-firebase/messaging
- @react-native-firebase/firestore
- @react-native-firebase/storage
- @react-native-firebase/database

### UI & Navigation
- react-native-vector-icons
- react-native-responsive-dimensions
- react-native-element-dropdown
- react-native-keyboard-aware-scroll-view
- react-native-toast-message

### Features
- react-native-agora (Video calling)
- react-native-razorpay (Payments)
- react-native-gifted-chat (Chat)
- react-native-document-picker (File handling)
- @react-native-community/datetimepicker (Date picker)

## Configuration

### Android

1. Update `android/app/build.gradle` with your package name and version
2. Configure signing keys in `android/app/build.gradle`
3. Update `AndroidManifest.xml` with required permissions

### iOS

1. Update bundle identifier in Xcode project
2. Configure signing certificates in Xcode
3. Update `Info.plist` with required permissions and URL schemes

## Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated in `android/app/build/outputs/apk/release/`

### iOS

1. Open `ios/PatientApp.xcworkspace` in Xcode
2. Select your target device/simulator
3. Product > Archive
4. Follow the App Store submission process

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npm start --reset-cache
```

**iOS build issues:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android build issues:**
```bash
cd android
./gradlew clean
cd ..
```

**Node modules issues:**
```bash
rm -rf node_modules
npm install
```

## Permissions

The app requires the following permissions:

- Camera (for video consultations)
- Microphone (for video consultations)
- Storage (for file uploads)
- Notifications (for push notifications)
- Network access (for API calls)

## API Integration

The app communicates with a backend API. Ensure you have:
- Valid API endpoint configured in `.env`
- Authentication tokens properly handled
- API endpoints for:
  - User registration and authentication
  - Therapist listing and booking
  - Chat and messaging
  - Payment processing
  - Schedule management

## Security Notes

- Never commit sensitive credentials to version control
- Keep API keys and secrets in environment variables
- Use secure storage for authentication tokens
- Validate all user inputs
- Implement proper error handling

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on both iOS and Android
4. Submit a pull request

## License

[Specify your license here]

## Support

For issues and questions, please contact the development team or open an issue in the repository.

## Version

Current version: 2.1.15

## Additional Notes

- The app uses Firebase for backend services including messaging, storage, and database
- Video calling is powered by Agora SDK
- Payment processing is handled through Razorpay
- The app supports both authenticated and unauthenticated states
- Offline functionality is available for certain features
