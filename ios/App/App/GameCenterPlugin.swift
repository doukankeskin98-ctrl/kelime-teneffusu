import UIKit
import GameKit
import Capacitor

/// Game Center is optional platform identity, never our Arena/cloud-save account.
@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameCenterPlugin"
    public let jsName = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openDashboard", returnType: CAPPluginReturnPromise)
    ]
    private var pending: CAPPluginCall?
    private var timeout: DispatchWorkItem?
    private var attempted = false
    private var operation = UUID()
    private var configured: Bool { Bundle.main.object(forInfoDictionaryKey: "KTGameCenterEnabled") as? Bool == true }
    private func result(_ status: String) -> [String: Any] {
        ["configured": configured, "authenticated": configured && GKLocalPlayer.local.isAuthenticated, "status": status]
    }
    private func finish(_ status: String, token: UUID) {
        guard token == operation else { return }
        timeout?.cancel(); timeout = nil
        let call = pending; pending = nil
        call?.resolve(result(status))
    }
    @objc func status(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(self.result(self.configured ? (GKLocalPlayer.local.isAuthenticated ? "authenticated" : "signedOut") : "notConfigured")) }
    }
    @objc func authenticate(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { call.resolve(["configured": false, "authenticated": false, "status": "unavailable"]); return }
            guard self.configured else { call.resolve(self.result("notConfigured")); return }
            guard !GKLocalPlayer.local.isAuthenticated else { call.resolve(self.result("authenticated")); return }
            guard self.pending == nil else { call.resolve(self.result("busy")); return }
            guard !self.attempted || call.getBool("interactive") == true else { call.resolve(self.result("signedOut")); return }
            guard UIApplication.shared.applicationState == .active, let presenter = self.bridge?.viewController,
                  presenter.viewIfLoaded?.window != nil, presenter.presentedViewController == nil else { call.resolve(self.result("busy")); return }
            self.attempted = true
            self.pending = call
            let token = UUID(); self.operation = token
            let deadline = DispatchWorkItem { [weak self] in self?.finish("timedOut", token: token) }
            self.timeout = deadline
            DispatchQueue.main.asyncAfter(deadline: .now() + 60, execute: deadline)
            GKLocalPlayer.local.authenticateHandler = { [weak self] controller, error in
                DispatchQueue.main.async {
                    guard let self = self, self.pending != nil, self.operation == token else { return }
                    if GKLocalPlayer.local.isAuthenticated { self.finish("authenticated", token: token); return }
                    if let error = error as NSError? {
                        self.finish(error.domain == GKErrorDomain && error.code == GKError.Code.cancelled.rawValue ? "cancelled" : "unavailable", token: token); return
                    }
                    guard let controller = controller else { self.finish("signedOut", token: token); return }
                    guard UIApplication.shared.applicationState == .active, let presenter = self.bridge?.viewController,
                          presenter.viewIfLoaded?.window != nil, presenter.presentedViewController == nil else { self.finish("busy", token: token); return }
                    presenter.present(controller, animated: true)
                }
            }
        }
    }
    @objc func openDashboard(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { call.resolve(["status": "unavailable"]); return }
            guard self.configured else { call.resolve(self.result("notConfigured")); return }
            guard GKLocalPlayer.local.isAuthenticated else { call.resolve(self.result("signedOut")); return }
            guard self.pending == nil, UIApplication.shared.applicationState == .active,
                  let presenter = self.bridge?.viewController, let window = presenter.viewIfLoaded?.window,
                  presenter.presentedViewController == nil, !GKAccessPoint.shared.isPresentingGameCenter else { call.resolve(self.result("busy")); return }
            self.pending = call
            let token = UUID(); self.operation = token
            let deadline = DispatchWorkItem { [weak self] in self?.finish("timedOut", token: token) }
            self.timeout = deadline
            DispatchQueue.main.asyncAfter(deadline: .now() + 10, execute: deadline)
            GKAccessPoint.shared.parentWindow = window
            // Keep the floating access point off the board. This completion means opened, not dismissed.
            GKAccessPoint.shared.isActive = false
            GKAccessPoint.shared.trigger { self.finish("opened", token: token) }
        }
    }
}
