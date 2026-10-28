import { useEffect, useState } from "react";
import {
  UserRound,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { getSettings, updateProfile, updatePassword } from "../settings.api";

const initialProfile = {
  name: "",
  email: "",
};

const initialPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(date);
}

function Notice({ type = "success", children }) {
  const success = type === "success";

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {success ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { admin, refreshAdmin } = useAuth();

  const [profile, setProfile] = useState(initialProfile);
  const [password, setPassword] = useState(initialPassword);
  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setProfileError("");

      try {
        const response = await getSettings();
        const data = response.admin;

        if (cancelled) return;

        setAccount(data);
        setProfile({
          name: data.name ?? "",
          email: data.email ?? "",
        });
      } catch (error) {
        if (!cancelled) {
          setProfileError(error.message || "Failed to load account settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPassword((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (!name || !email) {
      setProfileError("Name and email are required.");
      return;
    }

    if (name.length > 100 || email.length > 255) {
      setProfileError("Name or email is too long.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setProfileSaving(true);

    try {
      const response = await updateProfile({ name, email });

      setProfile({
        name: response.admin.name,
        email: response.admin.email,
      });

      setAccount((current) => ({
        ...current,
        name: response.admin.name,
        email: response.admin.email,
      }));

      await refreshAdmin();
      setProfileSuccess(response.message || "Profile updated successfully.");
    } catch (error) {
      setProfileError(error.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!password.currentPassword || !password.newPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(password.newPassword).length > 72) {
      setPasswordError("New password exceeds the 72-byte limit.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (password.currentPassword === password.newPassword) {
      setPasswordError(
        "New password must be different from the current password.",
      );
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await updatePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });

      setPassword(initialPassword);
      setPasswordSuccess(response.message || "Password updated successfully.");
    } catch (error) {
      setPasswordError(error.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
          <ShieldCheck size={14} />
          ACCOUNT
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your administrator profile and account security.
        </p>
      </header>

      {profileError && !loading && <Notice type="error">{profileError}</Notice>}

      {loading ? (
        <div className="rounded-2xl border border-white/80 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading account settings...
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-sm">
                <UserRound size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {account?.name || admin?.name || "Administrator"}
                </h2>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {account?.email || admin?.email || "No email"}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={14} />
                Administrator
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <UserRound size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Profile Information
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Update your name and email address.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Full name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  disabled={profileSaving}
                />

                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  maxLength={255}
                  required
                  disabled={profileSaving}
                />

                {profileSuccess && <Notice>{profileSuccess}</Notice>}

                {profileError && <Notice type="error">{profileError}</Notice>}

                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={profileSaving}
                    disabled={loading || passwordSaving}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <LockKeyhole size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Change Password
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Use a strong password of at least 8 characters.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                  disabled={passwordSaving}
                />

                <Input
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={passwordSaving}
                />

                <Input
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  value={password.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={passwordSaving}
                />

                {passwordSuccess && <Notice>{passwordSuccess}</Notice>}

                {passwordError && <Notice type="error">{passwordError}</Notice>}

                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={passwordSaving}
                    disabled={loading || profileSaving}
                  >
                    Update password
                  </Button>
                </div>
              </form>
            </section>
          </div>

          <section className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <CalendarDays size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Account Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Account creation date:{" "}
                  <span className="font-medium text-slate-700">
                    {formatDate(account?.created_at)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Last profile update:{" "}
                  <span className="font-medium text-slate-700">
                    {formatDate(account?.updated_at)}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
