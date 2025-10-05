import Foundation
import os.log

/// Unified logging system for Boop iOS native code
/// Uses Apple's os.log for system integration and performance
public final class BoopLogger: IBoopLogger {

    // MARK: - Properties


    private let subsystem = "com.ios.boop"
    private var loggers: [String: Logger] = [:]

    /// Shared singleton instance
    public static let shared = BoopLogger()

    // MARK: - Initialization

    private init() {}

    // MARK: - Category Management

    /// Get or create a Logger for a specific category
    private func logger(for category: String) -> Logger {
        if let existingLogger = loggers[category] {
            return existingLogger
        }
        let newLogger = Logger(subsystem: subsystem, category: category)
        loggers[category] = newLogger
        return newLogger
    }

    // MARK: - IBoopLogger Protocol Implementation

    /// Log a debug message (lowest priority, only visible in debug builds)
    public func debug(_ message: String, category: String) {
        logger(for: category).debug("\(message)")
    }

    /// Log an info message (general informational messages)
    public func info(_ message: String, category: String) {
        logger(for: category).info("\(message)")
    }

    /// Log a notice message (default level, notable events)
    public func notice(_ message: String, category: String) {
        logger(for: category).notice("\(message)")
    }

    /// Log a warning message (unexpected but handled conditions)
    public func warning(_ message: String, category: String) {
        logger(for: category).warning("\(message)")
    }

    /// Log an error message (errors that should be investigated)
    public func error(_ message: String, category: String) {
        logger(for: category).error("\(message)")
    }

    /// Log a critical/fault message (serious errors, highest priority)
    public func critical(_ message: String, category: String) {
        logger(for: category).critical("\(message)")
    }
}
