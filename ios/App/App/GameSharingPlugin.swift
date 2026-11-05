import UIKit
import Capacitor

@objc(GameSharingPlugin)
public class GameSharingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameSharingPlugin"
    public let jsName = "GameSharing"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "share", returnType: CAPPluginReturnPromise)
    ]
    private var sharing = false

    @objc func share(_ call: CAPPluginCall) {
        // This bridge shares public invitations only, never a local URL or account data.
        guard let raw = call.getString("url"), let parts = URLComponents(string: raw),
              parts.scheme == "https", parts.host == "kelime-teneffusu.healica.chatgpt.site",
              parts.port == nil, parts.user == nil, parts.password == nil,
              parts.path == "/", parts.fragment == nil,
              let items = parts.queryItems, items.count == 1,
              let item = items.first, ["oda", "arkadas", "meydan"].contains(item.name),
              let code = item.value,
              code.range(of: item.name == "oda" ? "^[A-HJ-NP-Z2-9]{8}$" : "^[A-HJ-NP-Z2-9]{10}$", options: .regularExpression) != nil,
              let url = parts.url else { call.resolve(["status": "failed"]); return }
        let title = String((call.getString("title") ?? "Kelime Teneffüsü").prefix(140))
        DispatchQueue.main.async { [weak self] in
            guard let self = self, !self.sharing,
                  UIApplication.shared.applicationState == .active,
                  let presenter = self.bridge?.viewController,
                  presenter.viewIfLoaded?.window != nil,
                  presenter.presentedViewController == nil else {
                call.resolve(["status": "failed"]); return
            }
            self.sharing = true
            // A single text item keeps the address attached to its title when copied.
            // Separate text/URL items can paste only the title into plain-text fields.
            let invitation = title + "\n" + url.absoluteString
            let sheet = UIActivityViewController(activityItems: [invitation], applicationActivities: nil)
            sheet.completionWithItemsHandler = { [weak self] activity, completed, _, error in
                self?.sharing = false
                let status = error != nil ? "failed" : !completed ? "cancelled" : activity == .copyToPasteboard ? "copied" : "shared"
                call.resolve(["status": status])
            }
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = presenter.view
                popover.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.maxY - 1, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            presenter.present(sheet, animated: true)
        }
    }
}
