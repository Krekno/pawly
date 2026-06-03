"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { postApi, userApi, authApi } from "@/lib/api";
import { PostCard, PostResponse } from "@/components/PostCard";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) return;
      
      setLoading(true);
      setError(null);
      try {
        const meRes = await authApi.getMe().catch(() => null);
        setCurrentUser(meRes);

        const [postsRes, usersRes] = await Promise.all([
          postApi.search(query),
          userApi.search(query),
        ]);

        if (postsRes && postsRes.content) {
          setPosts(postsRes.content);
        } else if (Array.isArray(postsRes)) {
          setPosts(postsRes);
        }

        if (usersRes && usersRes.content) {
          setUsers(usersRes.content);
        } else if (Array.isArray(usersRes)) {
          setUsers(usersRes);
        }

      } catch (err: any) {
        setError(err.message || "Failed to search.");
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto mt-4">
      <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>

      <div className="flex border-b border-border">
        <button
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "posts" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "users" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Searching...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : activeTab === "posts" ? (
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No posts found.</p>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUser={currentUser} 
                  onDelete={handlePostDeleted} 
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No users found.</p>
            ) : (
              users.map((user) => (
                <Link key={user.id} href={`/users/${user.username}`}>
                  <div className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg overflow-hidden border border-border shrink-0">
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{user.username}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
