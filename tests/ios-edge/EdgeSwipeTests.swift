import XCTest

final class EdgeSwipeTests: XCTestCase {
    func testOuterRowAndIncompleteName() throws {
        let app = XCUIApplication(bundleIdentifier: "com.kelimeteneffusu.edgeqa")
        app.launch()
        let board = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Kelime tahtası.")).firstMatch
        XCTAssertTrue(board.waitForExistence(timeout: 15), app.debugDescription)
        let rect = board.frame
        XCTAssertGreaterThan(rect.width, 260)
        func cell(_ row: CGFloat, _ column: CGFloat) -> XCUICoordinate {
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: rect.minX + column * rect.width / 9, dy: rect.minY + row * rect.height / 9))
        }
        cell(0.5, 7.5).press(forDuration: 0.1, thenDragTo: cell(0.5, 0.5))
        let correction = app.staticTexts["B harfinden başla."].firstMatch
        XCTAssertTrue(correction.waitForExistence(timeout: 4), app.debugDescription)
        cell(0.5, 8.5).press(forDuration: 0.1, thenDragTo: cell(-0.16, -0.05))
        let found = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "BADİ EKREM bulundu")).firstMatch
        XCTAssertTrue(found.waitForExistence(timeout: 5), app.debugDescription)
        let progress = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Bulunan kelimeler")).firstMatch
        print("ACCEPTED swipe on canonical 9x9; board=\(rect); progress=\(String(describing: progress.value))")
        let proof = XCTAttachment(screenshot: app.screenshot())
        proof.name = "native-edge-accepted"
        proof.lifetime = .keepAlways
        add(proof)
    }
}
