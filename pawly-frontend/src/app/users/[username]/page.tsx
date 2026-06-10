"use client";

import { use, useEffect, useState } from "react";
import { userApi, authApi } from "@/lib/api";
import { PostCard, PostResponse } from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import { UserListModal } from "@/components/UserListModal";

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  following?: boolean;
  posts?: PostResponse[];
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [data, meRes] = await Promise.all([
          userApi.getProfile(username),
          authApi.getMe().catch(() => null)
        ]);

        if (data) {
          data.following = data.following ?? data.following ?? false;
        }

        setProfile(data);
        setCurrentUser(meRes);
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  const toggleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.following) {
        await userApi.unfollow(profile.id);
        setProfile({ ...profile, following: false, followerCount: profile.followerCount - 1 });
      } else {
        await userApi.follow(profile.id);
        setProfile({ ...profile, following: true, followerCount: profile.followerCount + 1 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeleted = (deletedId: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      posts: profile.posts?.filter(p => p.id !== deletedId)
    });
  };

  const handleFollowersClick = async () => {
    setModalTitle("Followers");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await userApi.getFollowers(username);
      setModalUsers(res.content || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFollowingClick = async () => {
    setModalTitle("Following");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await userApi.getFollowing(username);
      setModalUsers(res.content || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading profile...</div>;
  }

  if (error || !profile) {
    return <div className="text-center py-10 text-red-500">{error || "User not found."}</div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="p-6 border border-border rounded-lg bg-background flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold overflow-hidden border border-border shrink-0">
          {profile.profilePictureUrl ? (
            <img src={profile.profilePictureUrl} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile.username.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-sm text-muted-foreground mt-1">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>

        {profile.bio && <p className="text-sm max-w-sm">{profile.bio}</p>}

        <div className="flex gap-6 mt-2">
          <button onClick={handleFollowersClick} className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{profile.followerCount}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Followers</span>
          </button>
          <button onClick={handleFollowingClick} className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{profile.followingCount}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Following</span>
          </button>
        </div>

        {currentUser?.username !== profile.username && (
          <Button
            variant={profile.following ? "outline" : "default"}
            className="mt-4 w-32"
            onClick={toggleFollow}
          >
            {profile.following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-xl font-bold px-2">Posts</h2>
        {profile.posts && profile.posts.length > 0 ? (
          profile.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onDelete={handlePostDeleted}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No posts yet.</p>
        )}
      </div>

      <UserListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        users={modalUsers}
        loading={modalLoading}
      />
    </div>
  );
}
