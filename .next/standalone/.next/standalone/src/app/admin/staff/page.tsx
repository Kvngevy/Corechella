"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldOff, ShieldCheck, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaffPermissionPicker } from "@/components/admin/staff-permission-picker";
import { usePlatform } from "@/lib/store/platform-store";
import {
  PERMISSION_LABELS,
  STAFF_DEFAULT_PERMISSIONS,
  type AdminPermission,
} from "@/lib/admin-permissions";

export default function StaffPage() {
  const {
    staff,
    session,
    addStaff,
    revokeStaffAccess,
    activateStaff,
    updateStaffPermissions,
    refreshStaff,
  } = usePlatform();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<AdminPermission[]>([...STAFF_DEFAULT_PERMISSIONS]);
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.role === "super_admin") {
      refreshStaff();
    }
  }, [session, refreshStaff]);

  if (session?.role !== "super_admin") {
    return (
      <div className="p-6 lg:p-10">
        <h1 className="font-heading text-3xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-muted">Only the super admin can grant or revoke staff access.</p>
      </div>
    );
  }

  const startEdit = (member: typeof staff[0]) => {
    setEditingId(member.id);
    setEditPermissions((member.permissions ?? []) as AdminPermission[]);
    setError("");
  };

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Name, email, and password (min 8 characters) are required");
      return;
    }
    if (permissions.length === 0) {
      setError("Select at least one permission for this staff member");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await addStaff({ name, email, password, permissions });
      setName("");
      setEmail("");
      setPassword("");
      setPermissions([...STAFF_DEFAULT_PERMISSIONS]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await revokeStaffAccess(id);
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke access");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await activateStaff(id, [...STAFF_DEFAULT_PERMISSIONS]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore access");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async (id: string) => {
    if (editPermissions.length === 0) {
      setError("Staff must have at least one permission");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateStaffPermissions(id, editPermissions);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Staff Access</h1>
          <p className="mt-1 text-muted">
            Grant staff monitoring access without super admin control. Only you can manage staff.
          </p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setError(""); }}>
          <Plus className="h-4 w-4" /> Grant Staff Access
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-electric/20 bg-electric/5 p-4 text-sm text-muted">
        <p className="font-medium text-white">Super admin vs staff</p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>Super admin: full platform control, including this staff page</li>
          <li>Staff: only the permissions you assign (orders, attendees, check-in, etc.)</li>
          <li>Revoked staff are blocked immediately on their next action and cannot log in</li>
        </ul>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {showForm && (
        <div className="mt-6 rounded-2xl electric-card p-6 max-w-2xl">
          <h2 className="font-heading text-lg font-bold text-white">New staff member</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Temporary password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
              />
            </div>
          </div>

          <div className="mt-6">
            <StaffPermissionPicker value={permissions} onChange={setPermissions} disabled={loading} />
          </div>

          <p className="mt-4 text-xs text-muted">
            Share login credentials at <span className="text-electric">/auth/login</span>. Staff sign in with email and password.
          </p>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? "Granting..." : "Grant Access"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl electric-card">
        <table className="w-full text-sm">
          <thead className="border-b border-electric/10">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-muted">Name</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Role</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Email</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Permissions</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Status</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => {
              const isSuperAdmin = s.role === "super_admin";
              const isEditing = editingId === s.id;
              const memberPermissions = (s.permissions ?? []) as AdminPermission[];

              return (
                <tr key={s.id} className="border-b border-electric/10 hover:bg-white/2 align-top">
                  <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant={isSuperAdmin ? "gold" : "default"}>
                      {isSuperAdmin ? "Super Admin" : "Staff"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted">{s.email}</td>
                  <td className="px-6 py-4 text-muted text-xs max-w-xs">
                    {isEditing ? (
                      <div className="space-y-3">
                        <StaffPermissionPicker
                          value={editPermissions}
                          onChange={setEditPermissions}
                          disabled={loading}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSavePermissions(s.id)} disabled={loading}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : isSuperAdmin ? (
                      "Full platform access"
                    ) : memberPermissions.length ? (
                      <ul className="space-y-1">
                        {memberPermissions.map((p) => (
                          <li key={p}>{PERMISSION_LABELS[p]}</li>
                        ))}
                      </ul>
                    ) : (
                      "No access"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>
                      {s.status === "active" ? "Active" : "Revoked"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {!isSuperAdmin && (
                      <div className="flex flex-wrap gap-2">
                        {s.status === "active" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(s)}
                              disabled={loading || isEditing}
                            >
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevoke(s.id)}
                              disabled={loading}
                            >
                              <ShieldOff className="h-3 w-3 mr-1" /> Revoke
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(s.id)}
                            disabled={loading}
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
