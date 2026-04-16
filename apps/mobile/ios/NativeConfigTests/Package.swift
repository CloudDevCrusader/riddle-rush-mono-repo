// swift-tools-version: 5.9
// Standalone package — not managed by Capacitor CLI. Validates ios/App/App/capacitor.config.json.
import PackageDescription

let package = Package(
    name: "NativeConfigTests",
    platforms: [
        .macOS(.v13),
        .iOS(.v15),
    ],
    targets: [
        .testTarget(
            name: "NativeConfigTests",
            path: "Tests/NativeConfigTests"
        ),
    ]
)
