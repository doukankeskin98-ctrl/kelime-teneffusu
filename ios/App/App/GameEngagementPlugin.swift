import UIKit
import UserNotifications
import StoreKit
import Capacitor

/// Device-local opt-in reminders and the system review sheet. No server or player ID.
@objc(GameEngagementPlugin)
public class GameEngagementPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameEngagementPlugin"
    public let jsName = "GameEngagement"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setReminder", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dismissOffer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestReview", returnType: CAPPluginReturnPromise)
    ]
    private let reminderID = "kt.daily.reminder"
    private let defaults = UserDefaults.standard
    private let prefix = "kt.engagement."
    private var reminderBusy = false
    private var reminderGeneration = 0

    public override func load() { recordDay() }
    private func recordDay() {
        let day = Calendar.current.startOfDay(for: Date()).timeIntervalSince1970
        let days = defaults.array(forKey: prefix + "days") as? [Double] ?? []
        if !days.contains(day) { defaults.set(Array((days + [day]).suffix(3)), forKey: prefix + "days") }
    }
    private func state(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
                let granted = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
                call.resolve(["available": true, "enabled": granted && requests.contains { $0.identifier == self.reminderID },
                    "permission": granted ? "granted" : settings.authorizationStatus == .denied ? "denied" : "unknown",
                    "offered": self.defaults.bool(forKey: self.prefix + "offered") || settings.authorizationStatus != .notDetermined])
            }
        }
    }
    @objc func status(_ call: CAPPluginCall) { state(call) }
    @objc func dismissOffer(_ call: CAPPluginCall) { defaults.set(true, forKey: prefix + "offered"); call.resolve() }
    @objc func setReminder(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let center = UNUserNotificationCenter.current()
            self.defaults.set(true, forKey: self.prefix + "offered")
            // OFF supersedes an in-flight permission/add request. A late callback
            // cannot re-arm a reminder after account erasure or explicit opt-out.
            guard call.getBool("enabled") == true else {
                self.reminderGeneration += 1
                center.removePendingNotificationRequests(withIdentifiers: [self.reminderID])
                center.removeDeliveredNotifications(withIdentifiers: [self.reminderID])
                self.state(call); return
            }
            guard !self.reminderBusy else { call.reject("Bir işlem sürüyor."); return }
            self.reminderBusy = true
            self.reminderGeneration += 1
            let generation = self.reminderGeneration
            center.requestAuthorization(options: [.alert]) { granted, error in
                DispatchQueue.main.async {
                    guard generation == self.reminderGeneration, granted, error == nil else {
                        self.reminderBusy = false; self.state(call); return
                    }
                    let content = UNMutableNotificationContent()
                    content.title = "Kelime Teneffüsü"
                    content.body = "Günün bulmacası seni bekliyor."
                    let trigger = UNCalendarNotificationTrigger(dateMatching: DateComponents(hour: 19, minute: 0), repeats: true)
                    center.add(UNNotificationRequest(identifier: self.reminderID, content: content, trigger: trigger)) { error in
                        DispatchQueue.main.async {
                            self.reminderBusy = false
                            if generation != self.reminderGeneration {
                                center.removePendingNotificationRequests(withIdentifiers: [self.reminderID])
                                self.state(call)
                            } else if let error = error { call.reject(error.localizedDescription) }
                            else { self.state(call) }
                        }
                    }
                }
            }
        }
    }
    @objc func requestReview(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            defer { call.resolve() }
            guard UIApplication.shared.applicationState == .active,
                let scene = self.bridge?.viewController?.view.window?.windowScene,
                scene.activationState == .foregroundActive else { return }
            self.recordDay()
            let days = self.defaults.array(forKey: self.prefix + "days") as? [Double] ?? []
            let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
            let last = self.defaults.double(forKey: self.prefix + "reviewAt")
            guard days.count >= 3, !version.isEmpty,
                self.defaults.string(forKey: self.prefix + "reviewVersion") != version,
                Date().timeIntervalSince1970 - last > 120 * 86400 else { return }
            self.defaults.set(version, forKey: self.prefix + "reviewVersion")
            self.defaults.set(Date().timeIntervalSince1970, forKey: self.prefix + "reviewAt")
            if #available(iOS 16.0, *) { AppStore.requestReview(in: scene) }
            else { SKStoreReviewController.requestReview(in: scene) }
        }
    }
}
