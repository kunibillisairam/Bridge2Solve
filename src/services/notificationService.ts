"use client";

export type NotificationRole = "CITIZEN" | "UNIVERSITY" | "INDUSTRY" | "ADMIN";

export type NotificationType = 
  | "PROBLEM_SUBMITTED"
  | "PROBLEM_VALIDATED"
  | "PROBLEM_REJECTED"
  | "DUPLICATE_DETECTED"
  | "UNIVERSITY_INTEREST"
  | "TEAM_ASSIGNMENT_REQUIRED"
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_APPROVED"
  | "PROPOSAL_REJECTED"
  | "PROPOSAL_CLARIFICATION"
  | "PROJECT_CREATED"
  | "PROJECT_MILESTONE"
  | "PROJECT_DELAYED"
  | "INDUSTRY_SUPPORT_SUBMITTED"
  | "INDUSTRY_SUPPORT_ACCEPTED"
  | "INDUSTRY_SUPPORT_REJECTED"
  | "INDUSTRY_SUPPORT_CLARIFICATION"
  | "IMPACT_ASSESSMENT_SUBMITTED"
  | "IMPACT_REVISION_REQUIRED"
  | "IMPACT_VERIFIED"
  | "PROJECT_COMPLETED";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface NotificationItem {
  id: string;
  userId: string; // e.g. "admin-1", "univ-1", "ind-1", "citizen-1"
  role: NotificationRole;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  entityType: "PROBLEM" | "PROPOSAL" | "PROJECT" | "INDUSTRY_REQUEST" | "IMPACT_ASSESSMENT";
  entityId: string;
  actionUrl: string;
  isRead: boolean;
  isActionRequired: boolean;
  createdAt: string; // ISO 8601 string
  readAt?: string;
}

// Initial Seed Data for Demo Accounts
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // ADMIN NOTIFICATIONS
  {
    id: "notif-admin-1",
    userId: "admin-1",
    role: "ADMIN",
    type: "IMPACT_ASSESSMENT_SUBMITTED",
    priority: "HIGH",
    title: "Impact Assessment Awaiting Verification",
    message: "Crop Yield Reduction due to Soil Salinity (PB-2026-002) submitted its final impact report for government verification.",
    entityType: "IMPACT_ASSESSMENT",
    entityId: "PB-2026-002",
    actionUrl: "/admin/projects/PB-2026-002",
    isRead: false,
    isActionRequired: true,
    createdAt: "2026-08-27T11:30:00.000Z",
  },
  {
    id: "notif-admin-2",
    userId: "admin-1",
    role: "ADMIN",
    type: "INDUSTRY_SUPPORT_SUBMITTED",
    priority: "MEDIUM",
    title: "CSR Support Request Received",
    message: "Tata Steel CSR Foundation submitted ₹7,50,000 support proposal for Water Scarcity in Rural Communities.",
    entityType: "INDUSTRY_REQUEST",
    entityId: "csr-req-1",
    actionUrl: "/admin/industry-support",
    isRead: false,
    isActionRequired: true,
    createdAt: "2026-08-27T09:15:00.000Z",
  },
  {
    id: "notif-admin-3",
    userId: "admin-1",
    role: "ADMIN",
    type: "PROBLEM_SUBMITTED",
    priority: "HIGH",
    title: "New Citizen Report Submitted",
    message: "New problem report 'Inadequate Municipal Waste Sorting at Source' submitted in Pune, Maharashtra awaiting validation.",
    entityType: "PROBLEM",
    entityId: "prob-3",
    actionUrl: "/admin/problems/prob-3",
    isRead: false,
    isActionRequired: true,
    createdAt: "2026-08-27T08:00:00.000Z",
  },
  {
    id: "notif-admin-4",
    userId: "admin-1",
    role: "ADMIN",
    type: "PROPOSAL_SUBMITTED",
    priority: "MEDIUM",
    title: "University Solution Proposal Submitted",
    message: "Indian Institute of Science submitted 'Community-Led Water Security' proposal for review.",
    entityType: "PROPOSAL",
    entityId: "prop-1",
    actionUrl: "/admin/proposals/prop-1",
    isRead: true,
    isActionRequired: false,
    createdAt: "2026-08-26T16:20:00.000Z",
    readAt: "2026-08-26T17:00:00.000Z",
  },

  // UNIVERSITY NOTIFICATIONS
  {
    id: "notif-univ-1",
    userId: "univ-1",
    role: "UNIVERSITY",
    type: "TEAM_ASSIGNMENT_REQUIRED",
    priority: "HIGH",
    title: "Research Team Assignment Required",
    message: "Registered problem 'Intermittent Electricity in Primary Schools' requires an assigned faculty-led research team.",
    entityType: "PROBLEM",
    entityId: "prob-4",
    actionUrl: "/university/teams",
    isRead: false,
    isActionRequired: true,
    createdAt: "2026-08-27T10:45:00.000Z",
  },
  {
    id: "notif-univ-2",
    userId: "univ-1",
    role: "UNIVERSITY",
    type: "PROPOSAL_APPROVED",
    priority: "MEDIUM",
    title: "Proposal Approved & Project Created",
    message: "Your proposal for 'Water Scarcity in Rural Communities' was approved. Active Project PB-2026-001 is now under implementation.",
    entityType: "PROJECT",
    entityId: "PB-2026-001",
    actionUrl: "/university/projects/PB-2026-001",
    isRead: false,
    isActionRequired: false,
    createdAt: "2026-08-26T14:10:00.000Z",
  },
  {
    id: "notif-univ-3",
    userId: "univ-1",
    role: "UNIVERSITY",
    type: "IMPACT_REVISION_REQUIRED",
    priority: "HIGH",
    title: "Impact Evidence Revision Requested",
    message: "Admin requested updated attendance records for 'Vernacular E-Learning Kits' impact report before final sign-off.",
    entityType: "IMPACT_ASSESSMENT",
    entityId: "PB-2026-004",
    actionUrl: "/university/projects/PB-2026-004",
    isRead: true,
    isActionRequired: false,
    createdAt: "2026-08-25T11:00:00.000Z",
    readAt: "2026-08-25T12:00:00.000Z",
  },

  // INDUSTRY NOTIFICATIONS
  {
    id: "notif-ind-1",
    userId: "ind-1",
    role: "INDUSTRY",
    type: "INDUSTRY_SUPPORT_ACCEPTED",
    priority: "HIGH",
    title: "CSR Support Request Formally Approved",
    message: "Your support offer for Project PB-2026-001 (Water Scarcity in Rural Communities) was ACCEPTED by Administration.",
    entityType: "INDUSTRY_REQUEST",
    entityId: "csr-req-1",
    actionUrl: "/industry/projects/PB-2026-001",
    isRead: false,
    isActionRequired: false,
    createdAt: "2026-08-27T09:30:00.000Z",
  },
  {
    id: "notif-ind-2",
    userId: "ind-1",
    role: "INDUSTRY",
    type: "PROJECT_COMPLETED",
    priority: "MEDIUM",
    title: "Sponsored Project Completed & Verified",
    message: "Project Vernacular E-Learning Kits (PB-2026-004) has achieved 100% completion and government verification.",
    entityType: "PROJECT",
    entityId: "PB-2026-004",
    actionUrl: "/industry/projects/PB-2026-004",
    isRead: true,
    isActionRequired: false,
    createdAt: "2026-08-20T15:00:00.000Z",
    readAt: "2026-08-20T16:00:00.000Z",
  },

  // CITIZEN NOTIFICATIONS
  {
    id: "notif-cit-1",
    userId: "citizen-1",
    role: "CITIZEN",
    type: "PROBLEM_VALIDATED",
    priority: "MEDIUM",
    title: "Problem Report Validated",
    message: "Your submission 'Water Scarcity in Rural Communities' was validated by field coordinators.",
    entityType: "PROBLEM",
    entityId: "prob-1",
    actionUrl: "/citizen",
    isRead: false,
    isActionRequired: false,
    createdAt: "2026-08-27T07:15:00.000Z",
  },
  {
    id: "notif-cit-2",
    userId: "citizen-1",
    role: "CITIZEN",
    type: "PROJECT_CREATED",
    priority: "HIGH",
    title: "University Project Under Way",
    message: "Indian Institute of Science has launched active research project PB-2026-001 to address your reported problem.",
    entityType: "PROJECT",
    entityId: "PB-2026-001",
    actionUrl: "/citizen",
    isRead: true,
    isActionRequired: false,
    createdAt: "2026-08-26T15:00:00.000Z",
    readAt: "2026-08-26T16:00:00.000Z",
  },
];

const isClient = typeof window !== "undefined";

function getStoredData<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key} to localStorage:`, error);
  }
}

// Relative Human-Friendly Time Calculator
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    // Simulation anchor date: 2026-08-27T12:49:28+05:30 (12:49 PM)
    const now = new Date("2026-08-27T12:49:28+05:30");
    const diffMs = now.getTime() - date.getTime();
    
    if (isNaN(diffMs) || diffMs < 0) return "Just now";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export const notificationService = {
  getAllNotifications(): NotificationItem[] {
    return getStoredData<NotificationItem[]>("pb_notifications", INITIAL_NOTIFICATIONS);
  },

  getNotificationsForUser(userId: string, role?: NotificationRole): NotificationItem[] {
    const all = this.getAllNotifications();
    return all.filter((n) => {
      if (role && n.role !== role) return false;
      return n.userId === userId || (role === "ADMIN" && n.role === "ADMIN");
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount(userId: string, role?: NotificationRole): number {
    return this.getNotificationsForUser(userId, role).filter((n) => !n.isRead).length;
  },

  getActionRequiredNotifications(userId: string, role?: NotificationRole): NotificationItem[] {
    return this.getNotificationsForUser(userId, role).filter((n) => n.isActionRequired && !n.isRead);
  },

  markAsRead(notificationId: string, userId: string): void {
    const all = this.getAllNotifications();
    const idx = all.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      all[idx].isRead = true;
      all[idx].readAt = new Date().toISOString();
      setStoredData("pb_notifications", all);
    }
  },

  markAllAsRead(userId: string, role?: NotificationRole): void {
    const all = this.getAllNotifications();
    const today = new Date().toISOString();
    let updated = false;

    for (let i = 0; i < all.length; i++) {
      if (all[i].userId === userId || (role === "ADMIN" && all[i].role === "ADMIN")) {
        if (!all[i].isRead) {
          all[i].isRead = true;
          all[i].readAt = today;
          updated = true;
        }
      }
    }

    if (updated) {
      setStoredData("pb_notifications", all);
    }
  },

  createNotification(data: {
    userId: string;
    role: NotificationRole;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    entityType: "PROBLEM" | "PROPOSAL" | "PROJECT" | "INDUSTRY_REQUEST" | "IMPACT_ASSESSMENT";
    entityId: string;
    actionUrl: string;
    isActionRequired?: boolean;
  }): NotificationItem {
    const all = this.getAllNotifications();
    const now = new Date();
    const isoNow = now.toISOString();

    // Spam Prevention: Avoid creating duplicate notifications for same entity+type within 1 minute
    const recentDuplicate = all.find(
      (n) =>
        n.userId === data.userId &&
        n.type === data.type &&
        n.entityId === data.entityId &&
        Math.abs(now.getTime() - new Date(n.createdAt).getTime()) < 60000
    );

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      role: data.role,
      type: data.type,
      priority: data.priority,
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
      actionUrl: data.actionUrl,
      isRead: false,
      isActionRequired: data.isActionRequired ?? false,
      createdAt: isoNow,
    };

    all.unshift(newNotification);
    setStoredData("pb_notifications", all);

    return newNotification;
  }
};
