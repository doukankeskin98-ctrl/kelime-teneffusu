import Capacitor

class GameBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameHapticsPlugin())
        bridge?.registerPluginInstance(GameSharingPlugin())
        bridge?.registerPluginInstance(GameCenterPlugin())
        bridge?.registerPluginInstance(GameEngagementPlugin())
    }
}
