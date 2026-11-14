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

final class ReleaseFlowTests: XCTestCase {
    func testSettingsAndChapter() throws {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "com.kelimeteneffusu.releaseqa052b")
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 20), app.debugDescription)
        let settings = app.buttons.matching(NSPredicate(format: "label == %@", "Ayarları aç")).firstMatch
        XCTAssertTrue(settings.waitForExistence(timeout: 20), app.debugDescription)
        settings.tap()
        let title = app.staticTexts["Ayarlar"].firstMatch
        XCTAssertTrue(title.waitForExistence(timeout: 5), app.debugDescription)
        let proof = XCTAttachment(screenshot: app.screenshot()); proof.name = "release-settings"; proof.lifetime = .keepAlways; add(proof)
        app.buttons["Diğer ayarlar"].firstMatch.tap()
        let reminder = app.switches.matching(NSPredicate(format: "label CONTAINS %@", "Günlük hatırlatma")).firstMatch
        XCTAssertTrue(reminder.waitForExistence(timeout: 5), app.debugDescription)
        reminder.tap()
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let allow = springboard.buttons.matching(NSPredicate(format: "label == %@ OR label == %@", "Allow", "İzin Ver")).firstMatch
        if allow.waitForExistence(timeout: 4) { allow.tap() }
        let reminderOn = NSPredicate(format: "value == %@", "1")
        expectation(for: reminderOn, evaluatedWith: reminder)
        waitForExpectations(timeout: 5)
        reminder.tap()
        expectation(for: NSPredicate(format: "value == %@", "0"), evaluatedWith: reminder)
        waitForExpectations(timeout: 5)
        let close = app.buttons["Kapat"].firstMatch
        XCTAssertTrue(close.exists); close.tap()
        let map = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "Yolculuğum")).firstMatch
        XCTAssertTrue(map.waitForExistence(timeout: 5), app.debugDescription); map.tap()
        XCTAssertTrue(app.staticTexts["Yakın dünyalar"].firstMatch.waitForExistence(timeout: 5), app.debugDescription)
        let mapProof = XCTAttachment(screenshot: app.screenshot()); mapProof.name = "release-map"; mapProof.lifetime = .keepAlways; add(mapProof)
        app.buttons["Kapat"].firstMatch.tap()
        let chapter = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "Bölüm 1")).firstMatch
        XCTAssertTrue(chapter.waitForExistence(timeout: 5), app.debugDescription); chapter.tap()
        let board = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Kelime tahtası.")).firstMatch
        XCTAssertTrue(board.waitForExistence(timeout: 10), app.debugDescription)
        let game = XCTAttachment(screenshot: app.screenshot()); game.name = "release-first-chapter"; game.lifetime = .keepAlways; add(game)
        let rect = board.frame
        func cell(_ row: CGFloat, _ column: CGFloat) -> XCUICoordinate {
            app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: rect.minX + (column + 0.5) * rect.width / 6, dy: rect.minY + (row + 0.5) * rect.height / 6))
        }
        let paths: [(CGFloat,CGFloat,CGFloat)] = [(5,1,5),(3,1,5),(1,1,4),(4,0,5)]
        for (row, start, end) in paths {
            cell(row,start).press(forDuration: 0.08, thenDragTo: cell(row,end), withVelocity: .slow, thenHoldForDuration: 0.05)
        }
        let resultTitle = app.staticTexts["Tebrikler!"].firstMatch
        let next = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Sonraki bölüm")).firstMatch
        XCTAssertTrue(resultTitle.waitForExistence(timeout: 8), app.debugDescription)
        let visibleResult = NSPredicate { _, _ in
            resultTitle.isHittable && next.isHittable && resultTitle.frame.minY > 40 && resultTitle.frame.maxY < app.frame.midY && next.frame.maxY < app.frame.maxY - 16
        }
        expectation(for: visibleResult, evaluatedWith: nil)
        waitForExpectations(timeout: 5)
        let outcome = XCTAttachment(screenshot: app.screenshot()); outcome.name = "release-native-result"; outcome.lifetime = .keepAlways; add(outcome)
        XCTAssertTrue(next.exists, app.debugDescription); next.tap()
        XCTAssertTrue(app.staticTexts["Bölüm 2"].firstMatch.waitForExistence(timeout: 5), app.debugDescription)

    }
}
