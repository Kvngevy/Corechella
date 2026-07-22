"use client";

import type { AdminPermission } from "@/lib/admin-permissions";
import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS,
  STAFF_ASSIGNABLE_PERMISSIONS,
} from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

interface StaffPermissionPickerProps {
  value: AdminPermission[];
  onChange: (permissions: AdminPermission[]) => void;
  disabled?: boolean;
}

export function StaffPermissionPicker({ value, onChange, disabled }: StaffPermissionPickerProps) {
  const toggle = (permission: AdminPermission) => {
    if (disabled) return;
    if (value.includes(permission)) {
      onChange(value.filter((p) => p !== permission));
    } else {
      onChange([...value, permission]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Platform access (staff cannot manage other staff)
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {STAFF_ASSIGNABLE_PERMISSIONS.map((permission) => {
          const checked = value.includes(permission);
          return (
            <button
              key={permission}
              type="button"
              disabled={disabled}
              onClick={() => toggle(permission)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                checked
                  ? "border-electric/40 bg-electric/10"
                  : "border-white/10 bg-white/5 hover:border-white/20",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <p className="text-sm font-medium text-white">{PERMISSION_LABELS[permission]}</p>
              <p className="mt-0.5 text-xs text-muted">{PERMISSION_DESCRIPTIONS[permission]}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
