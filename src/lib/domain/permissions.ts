/**
 * Who can see what.
 *
 * Navigation is generated from this, not hand-written per page - a golfer
 * should never see an Admin link they'd only bounce off, and a helper who can
 * sort groups should not find a Payments page waiting for them.
 */

import type { Permission, Staff, StaffRole } from "./types";

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  organizer: "Organizer",
  helper: "Helper",
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "club.manage": "Manage club settings",
  "club.branding": "Manage branding",
  "club.integrations": "Manage integrations",
  "club.pro": "Manage Pro and subscription",
  "events.view": "View events",
  "events.create": "Create events",
  "events.manage": "Manage events",
  "people.view": "View people",
  "people.manage": "Manage people",
  "payments.view": "View payments",
  "payments.manage": "Manage payments",
  "payments.refund": "Issue refunds",
};

/**
 * Sensible starting points per role.
 *
 * Financial access is deliberately absent from organizer and helper: someone
 * running Thursday night doesn't need to see the club's takings.
 */
export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  owner: Object.keys(PERMISSION_LABELS) as Permission[],
  manager: [
    "club.manage",
    "club.branding",
    "club.integrations",
    "events.view",
    "events.create",
    "events.manage",
    "people.view",
    "people.manage",
    "payments.view",
    "payments.manage",
  ],
  organizer: ["events.view", "events.create", "events.manage", "people.view"],
  helper: ["events.view", "people.view"],
};

export type ClubAccess = {
  signedIn: boolean;
  isOwner: boolean;
  isStaff: boolean;
  isMember: boolean;
  permissions: Set<Permission>;
};

export const ANONYMOUS_ACCESS: ClubAccess = {
  signedIn: false,
  isOwner: false,
  isStaff: false,
  isMember: false,
  permissions: new Set(),
};

export function buildAccess(options: {
  signedIn: boolean;
  isOwner: boolean;
  isMember: boolean;
  staff?: Staff | null;
}): ClubAccess {
  // Ownership is absolute within a club; it isn't a bundle of grantable checkboxes.
  const permissions = options.isOwner
    ? new Set(ROLE_PERMISSIONS.owner)
    : new Set(options.staff?.permissions ?? []);

  return {
    signedIn: options.signedIn,
    isOwner: options.isOwner,
    isStaff: options.isOwner || Boolean(options.staff),
    isMember: options.isMember,
    permissions,
  };
}

export function can(access: ClubAccess, permission: Permission): boolean {
  return access.permissions.has(permission);
}

export function canAny(access: ClubAccess, permissions: Permission[]): boolean {
  return permissions.some((permission) => access.permissions.has(permission));
}

/** Whether the Admin entry point should appear at all in the club sidebar. */
export function canSeeAdmin(access: ClubAccess): boolean {
  return access.permissions.size > 0;
}
