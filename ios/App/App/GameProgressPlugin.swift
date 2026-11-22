import Foundation
import Capacitor

/// A second, device-local copy independent of WKWebView storage. The JS layer
/// validates progress and ownership; CAS prevents concurrent snapshot replacement.
@objc(GameProgressPlugin)
public class GameProgressPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameProgressPlugin"
    public let jsName = "GameProgress"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "read", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "change", returnType: CAPPluginReturnPromise)
    ]
    private let io = DispatchQueue(label: "chat.healica.kelime.progress", qos: .userInitiated)
    private func location() throws -> URL {
        let root = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let folder = root.appendingPathComponent("KelimeProgress", isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        return folder.appendingPathComponent("copies.json")
    }
    private struct Snapshot {
        var rows: [String: String]
        var damaged: Data?
        func value(_ key: String) -> String? {
            // The coordinator treats this as an unreadable copy, never as an
            // empty save. Its healthy primary can repair it; two bad copies stop.
            if damaged != nil && key.hasPrefix("progress:") { return "unreadable-native-copy" }
            return rows[key]
        }
    }
    private func load(_ url: URL) throws -> Snapshot {
        guard FileManager.default.fileExists(atPath: url.path) else { return Snapshot(rows: [:]) }
        let data = try Data(contentsOf: url)
        if let rows = try? JSONDecoder().decode([String: String].self, from: data) { return Snapshot(rows: rows) }
        return Snapshot(rows: [:], damaged: data)
    }
    @objc func read(_ call: CAPPluginCall) {
        guard let keys = call.getArray("keys", String.self), keys.count <= 4 else { call.reject("Invalid progress keys"); return }
        io.async {
            do {
                let rows = try self.load(self.location())
                var values: [String: Any] = [:]
                for key in keys { values[key] = rows.value(key) as Any? ?? NSNull() }
                call.resolve(["values": values])
            } catch { call.reject("Progress backup could not be read") }
        }
    }
    @objc func change(_ call: CAPPluginCall) {
        guard let expected = call.getObject("expected"), let values = call.getObject("values"), expected.count <= 4, values.count <= 4 else { call.reject("Invalid progress transaction"); return }
        io.async {
            do {
                let url = try self.location()
                let snapshot = try self.load(url)
                var rows = snapshot.rows
                for (key, value) in expected {
                    guard value is NSNull || value is String else { call.reject("Invalid expected value"); return }
                    if snapshot.value(key) != (value as? String) { call.resolve(["changed": false]); return }
                }
                for (key, value) in values {
                    guard key == "active-owner" || key.hasPrefix("progress:") else { call.reject("Invalid progress key"); return }
                    if value is NSNull { rows.removeValue(forKey: key) }
                    else if let text = value as? String, text.utf8.count <= 600_000 { rows[key] = text }
                    else { call.reject("Invalid progress value"); return }
                }
                if let damaged = snapshot.damaged {
                    let quarantine = url.deletingLastPathComponent().appendingPathComponent("unreadable-" + UUID().uuidString + ".json")
                    try damaged.write(to: quarantine, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
                }
                let data = try JSONEncoder().encode(rows)
                try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
                let erasing = values.values.contains { value in
                    guard let text = value as? String, let bytes = text.data(using: .utf8), let row = (try? JSONSerialization.jsonObject(with: bytes)) as? [String: Any] else { return false }
                    return row["deleted"] as? Bool == true
                }
                if erasing {
                    // Damaged whole-file archives cannot be safely partitioned
                    // by owner. Explicit erasure purges them; healthy rows stay.
                    let files = try FileManager.default.contentsOfDirectory(at: url.deletingLastPathComponent(), includingPropertiesForKeys: nil)
                    for file in files where file.lastPathComponent.hasPrefix("unreadable-") { try FileManager.default.removeItem(at: file) }
                }
                call.resolve(["changed": true])
            } catch { call.reject("Progress backup could not be written") }
        }
    }
}
