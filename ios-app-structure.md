# iOS App Structure

This document outlines the recommended structure for the Campus Alert iOS app, including key files, directory organization, and code snippets for essential components.

## Project Structure

```
CampusAlert/
├── App/
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   └── CampusAlertApp.swift
├── Features/
│   ├── Authentication/
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   ├── OrganizationSelectionView.swift
│   │   │   └── ProfileView.swift
│   │   ├── ViewModels/
│   │   │   ├── LoginViewModel.swift
│   │   │   └── ProfileViewModel.swift
│   │   ├── Models/
│   │   │   └── AuthModels.swift
│   │   └── Services/
│   │       └── AuthService.swift
│   ├── Alerts/
│   │   ├── Views/
│   │   │   ├── AlertDashboardView.swift
│   │   │   ├── CurrentAlertView.swift
│   │   │   ├── AlertHistoryView.swift
│   │   │   └── AlertDetailView.swift
│   │   ├── ViewModels/
│   │   │   ├── AlertDashboardViewModel.swift
│   │   │   └── AlertHistoryViewModel.swift
│   │   ├── Models/
│   │   │   └── AlertModels.swift
│   │   └── Services/
│   │       └── AlertService.swift
│   ├── Notifications/
│   │   ├── Views/
│   │   │   └── NotificationSettingsView.swift
│   │   ├── ViewModels/
│   │   │   └── NotificationViewModel.swift
│   │   └── Services/
│   │       └── NotificationService.swift
│   └── Settings/
│       ├── Views/
│       │   └── SettingsView.swift
│       └── ViewModels/
│           └── SettingsViewModel.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── APIEndpoints.swift
│   │   ├── APIError.swift
│   │   └── NetworkMonitor.swift
│   ├── Storage/
│   │   ├── CoreDataManager.swift
│   │   ├── KeychainManager.swift
│   │   └── UserDefaultsManager.swift
│   ├── Models/
│   │   ├── User.swift
│   │   ├── Organization.swift
│   │   └── Alert.swift
│   └── Utilities/
│       ├── Constants.swift
│       ├── Extensions/
│       │   ├── Color+Extensions.swift
│       │   ├── Date+Extensions.swift
│       │   └── View+Extensions.swift
│       └── Helpers/
│           ├── Logger.swift
│           └── Formatters.swift
├── Resources/
│   ├── Assets.xcassets/
│   ├── Sounds/
│   │   └── critical.aiff
│   ├── Localizable.strings
│   └── Info.plist
└── CampusAlert.xcdatamodeld/
    └── CampusAlert.xcdatamodel/
```

## Key Files Implementation

### App Entry Point

#### CampusAlertApp.swift

```swift
import SwiftUI

@main
struct CampusAlertApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var networkMonitor = NetworkMonitor()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .environmentObject(networkMonitor)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        if authViewModel.isAuthenticated {
            MainTabView()
        } else {
            LoginView()
        }
    }
}
```

### AppDelegate for Push Notifications

#### AppDelegate.swift

```swift
import UIKit
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    let notificationService = NotificationService.shared
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Request notification permissions
        UNUserNotificationCenter.current().delegate = self
        
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions,
            completionHandler: { granted, error in
                if granted {
                    DispatchQueue.main.async {
                        application.registerForRemoteNotifications()
                    }
                }
                
                if let error = error {
                    print("Error requesting notification authorization: \(error.localizedDescription)")
                }
            }
        )
        
        // Configure notification categories and actions
        configureNotificationCategories()
        
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        notificationService.updateDeviceToken(tokenString)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error.localizedDescription)")
    }
    
    // Handle notifications when app is in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Extract alert data
        let userInfo = notification.request.content.userInfo
        notificationService.handleReceivedNotification(userInfo: userInfo)
        
        // Show the notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    // Handle notification actions
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        
        switch response.actionIdentifier {
        case "RESOLVE_ACTION":
            notificationService.handleResolveAction(userInfo: userInfo)
        case "VIEW_DETAILS_ACTION":
            notificationService.handleViewDetailsAction(userInfo: userInfo)
        case "ACKNOWLEDGE_ACTION":
            notificationService.handleAcknowledgeAction(userInfo: userInfo)
        default:
            // Handle default tap action
            notificationService.handleDefaultAction(userInfo: userInfo)
        }
        
        completionHandler()
    }
    
    private func configureNotificationCategories() {
        // Admin category with actions
        let resolveAction = UNNotificationAction(
            identifier: "RESOLVE_ACTION",
            title: "Resolve Alert",
            options: [.authenticationRequired]
        )
        
        let viewDetailsAction = UNNotificationAction(
            identifier: "VIEW_DETAILS_ACTION",
            title: "View Details",
            options: []
        )
        
        let adminCategory = UNNotificationCategory(
            identifier: "ADMIN_ALERT_CATEGORY",
            actions: [resolveAction, viewDetailsAction],
            intentIdentifiers: [],
            options: []
        )
        
        // User category with actions
        let acknowledgeAction = UNNotificationAction(
            identifier: "ACKNOWLEDGE_ACTION",
            title: "Acknowledge",
            options: []
        )
        
        let userCategory = UNNotificationCategory(
            identifier: "USER_ALERT_CATEGORY",
            actions: [acknowledgeAction, viewDetailsAction],
            intentIdentifiers: [],
            options: []
        )
        
        // Register the categories
        UNUserNotificationCenter.current().setNotificationCategories([adminCategory, userCategory])
    }
}
```

### Authentication

#### AuthService.swift

```swift
import Foundation
import AuthenticationServices
import Combine

class AuthService {
    static let shared = AuthService()
    
    private let baseURL = "https://api.campusalert.com"
    private let keychainManager = KeychainManager.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Authentication Methods
    
    func login(email: String, password: String) -> AnyPublisher<User, Error> {
        // For development/testing only
        return Future<User, Error> { promise in
            // Simulate network request
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                // Mock successful login
                let user = User(
                    id: UUID().uuidString,
                    name: "John Doe",
                    email: email,
                    role: "admin",
                    organizationId: "org123"
                )
                
                // Save auth token to keychain
                self.keychainManager.saveAuthToken("mock_token")
                
                promise(.success(user))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func loginWithMicrosoft(organizationId: String) {
        // In a real implementation, this would initiate the OAuth flow
        // For now, we'll just show how to set up the ASWebAuthenticationSession
        
        guard let authURL = URL(string: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&response_mode=query&scope=openid%20profile%20email&state=12345") else {
            return
        }
        
        let scheme = "campusalert"
        let session = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: scheme
        ) { callbackURL, error in
            guard error == nil, let callbackURL = callbackURL else {
                // Handle error
                return
            }
            
            // Parse the authorization code from the callback URL
            if let code = URLComponents(string: callbackURL.absoluteString)?
                .queryItems?
                .first(where: { $0.name == "code" })?
                .value {
                // Exchange the code for a token
                self.exchangeCodeForToken(code: code, organizationId: organizationId)
            }
        }
        
        session.presentationContextProvider = self as? ASWebAuthenticationPresentationContextProviding
        session.start()
    }
    
    private func exchangeCodeForToken(code: String, organizationId: String) {
        // In a real implementation, this would make a network request to exchange the code for a token
        // For now, we'll just simulate a successful token exchange
        
        // Save the token to keychain
        keychainManager.saveAuthToken("mock_token_from_microsoft")
        
        // Notify that authentication was successful
        NotificationCenter.default.post(
            name: Notification.Name("AuthenticationSuccessful"),
            object: nil,
            userInfo: ["organizationId": organizationId]
        )
    }
    
    func logout() {
        // Clear auth token from keychain
        keychainManager.deleteAuthToken()
        
        // Notify that logout was successful
        NotificationCenter.default.post(name: Notification.Name("LogoutSuccessful"), object: nil)
    }
    
    func refreshToken() -> AnyPublisher<Bool, Error> {
        // In a real implementation, this would make a network request to refresh the token
        // For now, we'll just simulate a successful token refresh
        
        return Future<Bool, Error> { promise in
            // Simulate network request
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                // Save new auth token to keychain
                self.keychainManager.saveAuthToken("new_mock_token")
                
                promise(.success(true))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Helper Methods
    
    func isAuthenticated() -> Bool {
        return keychainManager.getAuthToken() != nil
    }
    
    func getAuthToken() -> String? {
        return keychainManager.getAuthToken()
    }
}
```

### Alert Management

#### AlertService.swift

```swift
import Foundation
import Combine

class AlertService {
    static let shared = AlertService()
    
    private let baseURL = "https://api.campusalert.com"
    private let apiClient = APIClient.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Alert Methods
    
    func getCurrentAlert() -> AnyPublisher<Alert?, Error> {
        let endpoint = "\(baseURL)/api/alerts/current"
        
        return apiClient.get(endpoint)
            .map { (alert: Alert?) -> Alert? in
                return alert
            }
            .eraseToAnyPublisher()
    }
    
    func getAlertHistory() -> AnyPublisher<[Alert], Error> {
        let endpoint = "\(baseURL)/api/alerts/history"
        
        return apiClient.get(endpoint)
            .map { (alerts: [Alert]) -> [Alert] in
                return alerts
            }
            .eraseToAnyPublisher()
    }
    
    func initiateAlert(type: String, note: String? = nil) -> AnyPublisher<Alert, Error> {
        let endpoint = "\(baseURL)/api/alerts/initiate"
        let parameters: [String: Any] = [
            "type": type,
            "note": note ?? ""
        ]
        
        return apiClient.post(endpoint, parameters: parameters)
            .map { (alert: Alert) -> Alert in
                return alert
            }
            .eraseToAnyPublisher()
    }
    
    func resolveAlert() -> AnyPublisher<Alert, Error> {
        let endpoint = "\(baseURL)/api/alerts/resolve"
        
        return apiClient.put(endpoint, parameters: nil)
            .map { (alert: Alert) -> Alert in
                return alert
            }
            .eraseToAnyPublisher()
    }
    
    func changeAlertType(newType: String) -> AnyPublisher<Alert, Error> {
        let endpoint = "\(baseURL)/api/alerts/change-type"
        let parameters: [String: Any] = [
            "type": newType
        ]
        
        return apiClient.put(endpoint, parameters: parameters)
            .map { (alert: Alert) -> Alert in
                return alert
            }
            .eraseToAnyPublisher()
    }
}
```

### Push Notification Handling

#### NotificationService.swift

```swift
import Foundation
import UserNotifications

class NotificationService {
    static let shared = NotificationService()
    
    private let baseURL = "https://api.campusalert.com"
    private let apiClient = APIClient.shared
    private let keychainManager = KeychainManager.shared
    
    // MARK: - Device Registration
    
    func updateDeviceToken(_ token: String) {
        guard let organizationId = UserDefaultsManager.shared.getOrganizationId(),
              keychainManager.getAuthToken() != nil else {
            // Not logged in or no organization selected
            return
        }
        
        let endpoint = "\(baseURL)/api/devices/update-token"
        let parameters: [String: Any] = [
            "deviceToken": token,
            "deviceType": "iOS",
            "deviceName": UIDevice.current.name,
            "osVersion": UIDevice.current.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown",
            "organizationId": organizationId
        ]
        
        apiClient.post(endpoint, parameters: parameters) { result in
            switch result {
            case .success:
                print("Device token updated successfully")
            case .failure(let error):
                print("Failed to update device token: \(error.localizedDescription)")
            }
        }
    }
    
    func unregisterDevice() {
        guard let token = UserDefaultsManager.shared.getDeviceToken() else {
            return
        }
        
        let endpoint = "\(baseURL)/api/devices/unregister"
        let parameters: [String: Any] = [
            "deviceToken": token
        ]
        
        apiClient.post(endpoint, parameters: parameters) { result in
            switch result {
            case .success:
                print("Device unregistered successfully")
                UserDefaultsManager.shared.clearDeviceToken()
            case .failure(let error):
                print("Failed to unregister device: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - Notification Handling
    
    func handleReceivedNotification(userInfo: [AnyHashable: Any]) {
        guard let alertId = userInfo["alertId"] as? String,
              let alertType = userInfo["alertType"] as? String else {
            return
        }
        
        // Store the alert locally for offline access
        let alert = Alert(
            id: alertId,
            type: alertType,
            timestamp: Date(),
            active: true,
            initiatedBy: userInfo["initiatedBy"] as? String ?? "Unknown",
            note: userInfo["note"] as? String
        )
        
        CoreDataManager.shared.saveAlert(alert)
        
        // Post notification for UI update
        NotificationCenter.default.post(
            name: Notification.Name("AlertReceived"),
            object: nil,
            userInfo: ["alert": alert]
        )
    }
    
    // MARK: - Action Handlers
    
    func handleResolveAction(userInfo: [AnyHashable: Any]) {
        guard let alertId = userInfo["alertId"] as? String else {
            return
        }
        
        // Call API to resolve the alert
        let endpoint = "\(baseURL)/api/alerts/resolve"
        let parameters: [String: Any] = [
            "alertId": alertId
        ]
        
        apiClient.put(endpoint, parameters: parameters) { result in
            switch result {
            case .success:
                print("Alert resolved successfully")
                
                // Update local storage
                CoreDataManager.shared.updateAlertStatus(id: alertId, active: false)
                
                // Post notification for UI update
                NotificationCenter.default.post(
                    name: Notification.Name("AlertResolved"),
                    object: nil,
                    userInfo: ["alertId": alertId]
                )
                
            case .failure(let error):
                print("Failed to resolve alert: \(error.localizedDescription)")
            }
        }
    }
    
    func handleViewDetailsAction(userInfo: [AnyHashable: Any]) {
        guard let alertId = userInfo["alertId"] as? String else {
            return
        }
        
        // Post notification to navigate to alert details
        NotificationCenter.default.post(
            name: Notification.Name("ViewAlertDetails"),
            object: nil,
            userInfo: ["alertId": alertId]
        )
    }
    
    func handleAcknowledgeAction(userInfo: [AnyHashable: Any]) {
        guard let alertId = userInfo["alertId"] as? String else {
            return
        }
        
        // Call API to acknowledge the alert
        let endpoint = "\(baseURL)/api/alerts/acknowledge"
        let parameters: [String: Any] = [
            "alertId": alertId
        ]
        
        apiClient.post(endpoint, parameters: parameters) { result in
            switch result {
            case .success:
                print("Alert acknowledged successfully")
                
                // Post notification for UI update
                NotificationCenter.default.post(
                    name: Notification.Name("AlertAcknowledged"),
                    object: nil,
                    userInfo: ["alertId": alertId]
                )
                
            case .failure(let error):
                print("Failed to acknowledge alert: \(error.localizedDescription)")
            }
        }
    }
    
    func handleDefaultAction(userInfo: [AnyHashable: Any]) {
        // Default action when notification is tapped
        guard let alertId = userInfo["alertId"] as? String else {
            return
        }
        
        // Post notification to navigate to alert details
        NotificationCenter.default.post(
            name: Notification.Name("ViewAlertDetails"),
            object: nil,
            userInfo: ["alertId": alertId]
        )
    }
}
```

### Core Data Model

#### CampusAlert.xcdatamodeld

```swift
// Alert Entity
entity Alert {
    id: String
    type: String
    timestamp: Date
    active: Boolean
    initiatedBy: String
    resolvedBy: String?
    resolvedAt: Date?
    note: String?
    organizationId: String
}

// User Entity
entity User {
    id: String
    name: String
    email: String
    role: String
    organizationId: String
    avatarUrl: String?
}

// Organization Entity
entity Organization {
    id: String
    name: String
    domain: String
    logoUrl: String?
    primaryColor: String?
    secondaryColor: String?
    evacuationLocation: String?
    shelterHazardType: String?
}

// Device Entity
entity Device {
    id: String
    token: String
    lastRegistered: Date
}

// Offline Action Entity
entity OfflineAction {
    id: String
    actionType: String
    parameters: Binary
    timestamp: Date
    processed: Boolean
}
```

### Main Views

#### AlertDashboardView.swift

```swift
import SwiftUI

struct AlertDashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = AlertDashboardViewModel()
    @State private var showingAlertOptions = false
    @State private var alertNote = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color(UIColor.systemBackground)
                    .edgesIgnoringSafeArea(.all)
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Current Alert Section
                        if let currentAlert = viewModel.currentAlert {
                            CurrentAlertView(alert: currentAlert, onResolve: {
                                viewModel.resolveAlert()
                            }, onChangeType: { newType in
                                viewModel.changeAlertType(newType: newType)
                            })
                        } else {
                            // Initiate Alert Section
                            VStack(spacing: 16) {
                                Text("Initiate Emergency Response")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                
                                TextEditor(text: $alertNote)
                                    .frame(height: 100)
                                    .padding(8)
                                    .background(Color(UIColor.secondarySystemBackground))
                                    .cornerRadius(8)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                    )
                                    .padding(.bottom, 8)
                                
                                // Alert Type Buttons
                                LazyVGrid(columns: [
                                    GridItem(.flexible()),
                                    GridItem(.flexible())
                                ], spacing: 16) {
                                    AlertTypeButton(type: "hold", title: "Hold", icon: "pause.circle.fill", color: .yellow) {
                                        viewModel.initiateAlert(type: "hold", note: alertNote)
                                        alertNote = ""
                                    }
                                    
                                    AlertTypeButton(type: "secure", title: "Secure", icon: "lock.shield.fill", color: .blue) {
                                        viewModel.initiateAlert(type: "secure", note: alertNote)
                                        alertNote = ""
                                    }
                                    
                                    AlertTypeButton(type: "lockdown", title: "Lockdown", icon: "lock.fill", color: .red) {
                                        viewModel.initiateAlert(type: "lockdown", note: alertNote)
                                        alertNote = ""
                                    }
                                    
                                    AlertTypeButton(type: "evacuate", title: "Evacuate", icon: "arrow.right.square.fill", color: .orange) {
                                        viewModel.initiateAlert(type: "evacuate", note: alertNote)
                                        alertNote = ""
                                    }
                                    
                                    AlertTypeButton(type: "shelter", title: "Shelter", icon: "house.fill", color: .purple) {
                                        viewModel.initiateAlert(type: "shelter", note: alertNote)
                                        alertNote = ""
                                    }
                                }
                            }
                            .padding()
                            .background(Color(UIColor.tertiarySystemBackground))
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                        }
                        
                        // Recent Alerts Section
                        VStack(spacing: 12) {
                            HStack {
                                Text("Recent Alerts")
                                    .font(.headline)
                                
                                Spacer()
                                
                                NavigationLink(destination: AlertHistoryView()) {
                                    Text("View All")
                                        .font(.subheadline)
                                        .foregroundColor(.blue)
                                }
                            }
                            
                            if viewModel.recentAlerts.isEmpty {
                                Text("No recent alerts")
                                    .foregroundColor(.gray)
                                    .padding()
                                    .frame(maxWidth: .infinity)
                                    .background(Color(UIColor.secondarySystemBackground))
                                    .cornerRadius(8)
                            } else {
                                ForEach(viewModel.recentAlerts.prefix(3), id: \.id) { alert in
                                    AlertListItemView(alert: alert)
                                }
                            }
                        }
                        .padding()
                        .background(Color(UIColor.tertiarySystemBackground))
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                    }
                    .padding()
                }
            }
            .navigationTitle("Dashboard")
            .onAppear {
                viewModel.loadData()
            }
            .refreshable {
                viewModel.loadData()
            }
        }
    }
}

struct AlertTypeButton: View {
    let type: String
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 32))
                    .foregroundColor(color)
                
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(color.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(color.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

struct CurrentAlertView: View {
    let alert: Alert
    let onResolve: () -> Void
    let onChangeType: (String) -> Void
    @State private var showingTypeOptions = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Alert Header
            HStack {
                Text("ACTIVE \(alert.type.uppercased()) ALERT")
                    .font(.headline)
                    .foregroundColor(getColorForAlertType(alert.type))
                
                Spacer()
                
                Text(alert.timestamp.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            // Alert Message
            Text(getMessageForAlertType(alert.type))
                .font(.title3)
                .multilineTextAlignment(.center)
                .padding()
                .frame(maxWidth: .infinity)
                .background(getColorForAlertType(alert.type).opacity(0.1))
                .cornerRadius(8)
            
            // Alert Note
            if let note = alert.note, !note.isEmpty {
                Text(note)
                    .italic()
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(8)
            }
            
            // Initiated By
            Text("Initiated by \(alert.initiatedBy)")
                .font(.caption)
                .foregroundColor(.gray)
            
            // Action Buttons
            HStack(spacing: 16) {
                Button(action: onResolve) {
                    Text("Resolve Alert")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red)
                        .cornerRadius(8)
                }
                
                Button(action: {
                    showingTypeOptions = true
                }) {
                    Text("Change Type")
                        .font(.headline)
                        .foregroundColor(.primary)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(UIColor.secondarySystemBackground))
                        .cornerRadius(8)
                }
                .actionSheet(isPresented: $showingTypeOptions) {
                    ActionSheet(
                        title: Text("Change Alert Type"),
                        buttons: [
                            .default(Text("Hold")) { onChangeType("hold") },
                            .default(Text("Secure")) { onChangeType("secure") },
                            .default(Text("Lockdown")) { onChangeType("lockdown") },
                            .default(Text("Evacuate")) { onChangeType("evacuate") },
                            .default(Text("Shelter")) { onChangeType("shelter") },
                            .cancel()
                        ]
                    )
                }
            }
        }
        .padding()
        .background(Color(UIColor.tertiarySystemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    func getColorForAlertType(_ type: String) -> Color {
        switch type {
        case "hold": return .yellow
        case "secure": return .blue
        case "lockdown": return .red
        case "evacuate": return .orange
        case "shelter": return .purple
        default: return .gray
        }
    }
    
    func getMessageForAlertType(_ type: String) -> String {
        switch type {
        case "hold": return "Hold! Remain in your room or area. Clear the halls and outdoor areas."
        case "secure": return "Secure! Get inside. Lock outside doors."
        case "lockdown": return "Lockdown! Locks, Lights, Out of Sight!"
        case "evacuate": return "Evacuate to designated location!"
        case "shelter": return "Shelter for hazard!"
        default: return "Unknown alert type
