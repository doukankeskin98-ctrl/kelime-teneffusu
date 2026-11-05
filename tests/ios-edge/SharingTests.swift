import XCTest

final class SharingTests: XCTestCase {
    func testSystemShareCopyAndCancel() throws {
        let app = XCUIApplication(bundleIdentifier: "com.kelimeteneffusu.sharingqa")
        app.launch()
        for (kind, code) in [("oda", "ABCDEFGH"), ("arkadas", "ABCDEFGH23"), ("meydan", "23456789AB")] {
            let button = app.buttons[kind + " paylaş"]
            XCTAssertTrue(button.waitForExistence(timeout: 15), app.debugDescription)
            button.tap()
            let copy = app.descendants(matching: .any).matching(NSPredicate(format: "label == 'Copy' OR label == 'Kopyala'")).firstMatch
            XCTAssertTrue(copy.waitForExistence(timeout: 8), app.debugDescription)
            let proof = XCTAttachment(screenshot: app.screenshot())
            proof.name = "native-share-" + kind
            proof.lifetime = .keepAlways
            add(proof)
            copy.tap()
            XCTAssertTrue(app.staticTexts["copied · Davet bağlantısı kopyalandı."].waitForExistence(timeout: 8), app.debugDescription)
            XCTAssertTrue(app.staticTexts["https://kelime-teneffusu.healica.chatgpt.site/?" + kind + "=" + code].exists)
        }
        app.buttons["oda paylaş"].tap()
        let close = app.otherElements["PopoverDismissRegion"]
        XCTAssertTrue(close.waitForExistence(timeout: 8), app.debugDescription)
        close.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.1)).tap()
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'cancelled'")).firstMatch.waitForExistence(timeout: 8), app.debugDescription)
        app.buttons["oda paylaş"].tap()
        let copy = app.descendants(matching: .any).matching(NSPredicate(format: "label == 'Copy' OR label == 'Kopyala'")).firstMatch
        XCTAssertTrue(copy.waitForExistence(timeout: 8), app.debugDescription)
        copy.tap()
        XCTAssertTrue(app.staticTexts["copied · Davet bağlantısı kopyalandı."].waitForExistence(timeout: 8))
        let field = app.textViews["Yapıştırılan davet"]
        XCTAssertTrue(field.waitForExistence(timeout: 5), app.debugDescription)
        field.tap()
        field.press(forDuration: 1.1)
        let paste = app.descendants(matching: .any).matching(NSPredicate(format: "label == 'Paste' OR label == 'Yapıştır'")).firstMatch
        XCTAssertTrue(paste.waitForExistence(timeout: 5), app.debugDescription)
        paste.tap()
        let pasted = field.value as? String ?? ""
        XCTAssertTrue(pasted.contains("https://kelime-teneffusu.healica.chatgpt.site/?oda=ABCDEFGH"), pasted)
        XCTAssertFalse(pasted.contains("localhost"), pasted)
        XCTAssertFalse(pasted.contains("token="), pasted)
        let pastedProof = XCTAttachment(screenshot: app.screenshot())
        pastedProof.name = "native-invitation-pasted"
        pastedProof.lifetime = .keepAlways
        add(pastedProof)
    }
}
