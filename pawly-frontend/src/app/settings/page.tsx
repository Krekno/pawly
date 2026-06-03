"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePictureUrl: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const me = await authApi.getMe();
        setUser(me);
        setFormData({
          username: me.username || "",
          email: me.email || "",
          password: "",
          bio: me.bio || "",
          profilePictureUrl: me.profilePictureUrl || ""
        });
      } catch {
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      let uploadedUrl = formData.profilePictureUrl;
      
      if (file) {
        setMessage({ text: "Uploading image...", type: "info" });
        const uploadData = new FormData();
        uploadData.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        
        const uploadJson = await uploadRes.json();
        
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Failed to upload image");
        }
        
        uploadedUrl = uploadJson.url;
      }

      // Only send password if it's not empty
      const payload = { ...formData, profilePictureUrl: uploadedUrl };
      if (!payload.password) {
        delete (payload as any).password;
      }

      setMessage({ text: "Saving profile...", type: "info" });
      await authApi.update(payload);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      const me = await authApi.getMe();
      setUser(me);
      setFormData(prev => ({ 
        ...prev, 
        password: "",
        profilePictureUrl: uploadedUrl
      }));
      setFile(null);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await authApi.signout();
    } catch {
      // ignore
    }
    router.push("/auth/signin");
  }

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account Section */}
      <section className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 bg-muted/30 border-b border-border flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
          {message.text && (
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-500' : 
              message.type === 'error' ? 'text-red-500' : 
              'text-blue-500'
            }`}>
              {message.text}
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="divide-y divide-border">
          <div className="px-5 py-4 flex flex-col gap-2">
            <label className="text-sm font-medium">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md w-full"
            />
          </div>

          <div className="px-5 py-4 flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md w-full"
            />
          </div>

          <div className="px-5 py-4 flex flex-col gap-2">
            <label className="text-sm font-medium">Password (leave blank to keep current)</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md w-full"
              placeholder="New password"
            />
          </div>

          <div className="px-5 py-4 flex flex-col gap-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md w-full min-h-[80px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="px-5 py-4 flex flex-col gap-3">
            <label className="text-sm font-medium">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border shrink-0">
                {(previewUrl || formData.profilePictureUrl) ? (
                  <img 
                    src={previewUrl || formData.profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {formData.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="px-5 py-4 bg-muted/10 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red-500/20 overflow-hidden">
        <div className="px-5 py-4 bg-red-500/5 border-b border-red-500/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">Danger Zone</h2>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out of your account</p>
              <p className="text-sm text-muted-foreground">You will be redirected to the sign in page.</p>
            </div>
            <button
              onClick={handleSignOut}
              id="settings-signout"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
