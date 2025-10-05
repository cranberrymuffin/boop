import Foundation

/// Protocol defining the logging interface for dependency injection
public protocol IBoopLogger {
    /// Log a debug message (lowest priority, only visible in debug builds)
    func debug(_ message: String, category: String)

    /// Log an info message (general informational messages)
    func info(_ message: String, category: String)

    /// Log a notice message (default level, notable events)
    func notice(_ message: String, category: String)

    /// Log a warning message (unexpected but handled conditions)
    func warning(_ message: String, category: String)

    /// Log an error message (errors that should be investigated)
    func error(_ message: String, category: String)

    /// Log a critical/fault message (serious errors, highest priority)
    func critical(_ message: String, category: String)
}

// MARK: - Public Convenience Methods

public extension IBoopLogger {
    /// Quick access to debug logging
    func logDebug(_ message: String, category: String = "General") {
        debug(message, category: category)
    }

    /// Quick access to info logging
    func logInfo(_ message: String, category: String = "General") {
        info(message, category: category)
    }

    /// Quick access to notice logging
    func logNotice(_ message: String, category: String = "General") {
        notice(message, category: category)
    }

    /// Quick access to warning logging
    func logWarning(_ message: String, category: String = "General") {
        warning(message, category: category)
    }

    /// Quick access to error logging
    func logError(_ message: String, category: String = "General") {
        error(message, category: category)
    }

    /// Quick access to critical logging
    func logCritical(_ message: String, category: String = "General") {
        critical(message, category: category)
    }
}
