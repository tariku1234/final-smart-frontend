// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Complaint status options
export const COMPLAINT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  ESCALATED: "escalated",
}

// Department levels
export const DEPARTMENT_LEVELS = {
  WEREDA: "Wereda-AntiCorruption",
  KIFLEKETEMA: "Kifleketema-AntiCorruption",
  KENTIBA: "Kentiba-AntiCorruption",
}

// User roles
export const USER_ROLES = {
  CITIZEN: "citizen",
  STAKEHOLDER_OFFICE: "stakeholder_office",
  WEREDA_ANTI_CORRUPTION: "wereda_anti_corruption",
  KIFLEKETEMA_ANTI_CORRUPTION: "kifleketema_anti_corruption",
  KENTIBA_BIRO: "kentiba_biro",
}

// Complaint handlers
export const COMPLAINT_HANDLERS = {
  STAKEHOLDER_OFFICE: "stakeholder_office",
  WEREDA_ANTI_CORRUPTION: "wereda_anti_corruption",
  KIFLEKETEMA_ANTI_CORRUPTION: "kifleketema_anti_corruption",
  KENTIBA_BIRO: "kentiba_biro",
}

// Complaint stages
export const COMPLAINT_STAGES = {
  STAKEHOLDER_FIRST: "stakeholder_first",
  STAKEHOLDER_SECOND: "stakeholder_second",
  WEREDA_FIRST: "wereda_first",
  WEREDA_SECOND: "wereda_second",
  KIFLEKETEMA_FIRST: "kifleketema_first",
  KIFLEKETEMA_SECOND: "kifleketema_second",
  KENTIBA: "kentiba",
}

// Escalation time (in milliseconds)
export const ESCALATION_TIME = {
  WEREDA_TO_KIFLEKETEMA: 24 * 60 * 60 * 1000, // 1 day
  KIFLEKETEMA_TO_KENTIBA: 3 * 24 * 60 * 60 * 1000, // 3 days
}

// Alert priority levels
export const ALERT_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}

// Office status options
export const OFFICE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  LIMITED: "limited",
}

