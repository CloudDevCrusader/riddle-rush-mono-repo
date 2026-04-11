import XCTest

/// Mirrors checks in Android `CapacitorConfigTest` — ensures synced Capacitor JSON stays valid.
final class CapacitorConfigTests: XCTestCase {

    private func capacitorConfigURL() throws -> URL {
        let packageRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let iosDir = packageRoot.deletingLastPathComponent()
        let iosSynced = iosDir.appendingPathComponent("App/App/capacitor.config.json").standardizedFileURL
        let mobileDir = iosDir.deletingLastPathComponent()
        let androidTracked = mobileDir
            .appendingPathComponent("android/app/src/main/assets/capacitor.config.json")
            .standardizedFileURL

        if FileManager.default.fileExists(atPath: iosSynced.path) {
            return iosSynced
        }
        if FileManager.default.fileExists(atPath: androidTracked.path) {
            return androidTracked
        }
        XCTFail(
            "No capacitor.config.json — run cap sync ios, or keep Android assets copy under source control"
        )
        return iosSynced
    }

    private func configObject() throws -> [String: Any] {
        let url = try capacitorConfigURL()
        let data = try Data(contentsOf: url)
        let raw = try JSONSerialization.jsonObject(with: data, options: [])
        guard let obj = raw as? [String: Any] else {
            XCTFail("capacitor.config.json must be a JSON object")
            return [:]
        }
        return obj
    }

    func test_appId() throws {
        let obj = try configObject()
        XCTAssertEqual(obj["appId"] as? String, "com.riddlerush.game")
    }

    func test_appName() throws {
        let obj = try configObject()
        XCTAssertEqual(obj["appName"] as? String, "Riddle Rush")
    }

    func test_androidScheme_https() throws {
        let obj = try configObject()
        let server = obj["server"] as? [String: Any]
        XCTAssertEqual(server?["androidScheme"] as? String, "https")
    }

    func test_iosScheme_https() throws {
        let obj = try configObject()
        let server = obj["server"] as? [String: Any]
        XCTAssertEqual(server?["iosScheme"] as? String, "https")
    }

    func test_allowMixedContent_false() throws {
        let obj = try configObject()
        let android = obj["android"] as? [String: Any]
        XCTAssertEqual(android?["allowMixedContent"] as? Bool, false)
    }

    func test_plugins_includeCorePlugins() throws {
        let obj = try configObject()
        let plugins = obj["plugins"] as? [String: Any]
        XCTAssertNotNil(plugins?["SplashScreen"])
        XCTAssertNotNil(plugins?["StatusBar"])
        XCTAssertNotNil(plugins?["Keyboard"])
    }

    func test_backgroundColor_brandOrange() throws {
        let obj = try configObject()
        XCTAssertEqual(obj["backgroundColor"] as? String, "#ff6b35")
    }
}
