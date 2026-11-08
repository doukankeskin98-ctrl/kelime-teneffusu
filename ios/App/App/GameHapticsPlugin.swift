import UIKit
import QuartzCore
import Capacitor

/// Short, prepared impacts. No timers or pulse queue: feedback never owns input.
@objc(GameHapticsPlugin)
public class GameHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameHapticsPlugin"
    public let jsName = "GameHaptics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "selectionStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "selectionChanged", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "selectionEnd", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "word", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "landing", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "complete", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "menu", returnType: CAPPluginReturnPromise)
    ]
    private var letter: UIImpactFeedbackGenerator?
    private var wordImpact: UIImpactFeedbackGenerator?
    private var menuImpact: UIImpactFeedbackGenerator?
    private var landingImpact: UIImpactFeedbackGenerator?
    private var success: UINotificationFeedbackGenerator?
    private var selecting = false
    private var lastLetter = -Double.infinity
    private var inactiveObserver: NSObjectProtocol?

    public override func load() {
        inactiveObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification, object: nil, queue: .main
        ) { [weak self] _ in self?.reset() }
    }
    deinit { if let observer = inactiveObserver { NotificationCenter.default.removeObserver(observer) } }

    private func reset() {
        selecting = false
        letter = nil; wordImpact = nil; menuImpact = nil; landingImpact = nil; success = nil
        lastLetter = -Double.infinity
    }
    private func onMain(_ call: CAPPluginCall, pulse: Bool = false, _ action: @escaping () -> Void) {
        let requested = CACurrentMediaTime()
        DispatchQueue.main.async { [weak self] in
            defer { call.resolve() }
            guard let self = self else { return }
            guard UIApplication.shared.applicationState == .active else { self.reset(); return }
            // A delayed main-thread pulse feels detached from the finger. Drop it.
            guard !pulse || CACurrentMediaTime() - requested < 0.10 else { return }
            action()
        }
    }
    @objc func selectionStart(_ call: CAPPluginCall) {
        onMain(call) {
            self.selecting = true
            self.letter = self.letter ?? UIImpactFeedbackGenerator(style: .rigid)
            self.wordImpact = self.wordImpact ?? UIImpactFeedbackGenerator(style: .medium)
            self.success = self.success ?? UINotificationFeedbackGenerator()
            self.letter?.prepare(); self.wordImpact?.prepare(); self.success?.prepare()
        }
    }
    @objc func selectionChanged(_ call: CAPPluginCall) {
        onMain(call, pulse: true) {
            let now = CACurrentMediaTime()
            guard self.selecting, now - self.lastLetter >= 0.045 else { return }
            self.lastLetter = now
            self.letter?.impactOccurred(intensity: 0.78)
            self.letter?.prepare(); self.wordImpact?.prepare()
        }
    }
    @objc func selectionEnd(_ call: CAPPluginCall) {
        onMain(call) { self.selecting = false; self.letter = nil }
    }
    @objc func word(_ call: CAPPluginCall) {
        onMain(call, pulse: true) {
            self.selecting = false
            self.wordImpact = self.wordImpact ?? UIImpactFeedbackGenerator(style: .medium)
            self.landingImpact = self.landingImpact ?? UIImpactFeedbackGenerator(style: .light)
            self.landingImpact?.prepare()
            self.wordImpact?.impactOccurred(intensity: 1)
            self.wordImpact?.prepare()
        }
    }
    @objc func landing(_ call: CAPPluginCall) {
        onMain(call, pulse: true) {
            self.landingImpact = self.landingImpact ?? UIImpactFeedbackGenerator(style: .light)
            self.landingImpact?.impactOccurred(intensity: 0.95)
            self.landingImpact?.prepare()
        }
    }
    @objc func complete(_ call: CAPPluginCall) {
        onMain(call, pulse: true) {
            self.selecting = false
            self.success = self.success ?? UINotificationFeedbackGenerator()
            self.success?.notificationOccurred(.success)
        }
    }
    @objc func menu(_ call: CAPPluginCall) {
        onMain(call, pulse: true) {
            self.menuImpact = self.menuImpact ?? UIImpactFeedbackGenerator(style: .light)
            self.menuImpact?.impactOccurred(intensity: 0.85)
            self.menuImpact?.prepare()
        }
    }
}
