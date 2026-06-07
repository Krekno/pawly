"use client";

import { useEffect, useState } from "react";
import { postApi, authApi } from "@/lib/api";
import { PostCard, PostResponse } from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import { CreatePostModal } from "@/components/CreatePostModal";

export default function Home() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [feedType, setFeedType] = useState<"foryou" | "following">("foryou");

  useEffect(() => {
    async function fetchUser() {
      try {
        const meRes = await authApi.getMe().catch(() => null);
        setCurrentUser(meRes);
      } catch (err) {
        // ignore
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        let feedRes;
        if (feedType === "foryou") {
          feedRes = await postApi.getFeed();
        } else {
          // If trying to access following feed without being logged in, it will fail, 
          // but we will let the API call handle it or we can preemptively block
          if (!currentUser && feedType === "following") {
            setError("You need to sign in to see the following feed.");
            setLoading(false);
            return;
          }
          feedRes = await postApi.getFollowingFeed();
        }
        
        // Assuming the response is a Page<PostResponse> with `content` array
        if (feedRes && feedRes.content) {
          setPosts(feedRes.content);
        } else if (Array.isArray(feedRes)) {
          setPosts(feedRes);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load feed.");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [feedType, currentUser]);

  const handlePostCreated = (newPost: PostResponse) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedId));
  };





  return (
    <>
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <Button onClick={() => setIsModalOpen(true)}>New Post</Button>
        </div>

        <div className="flex gap-4 border-b pb-2">
          <button 
            className={`font-semibold ${feedType === "foryou" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            onClick={() => setFeedType("foryou")}
          >
            For You
          </button>
          <button 
            className={`font-semibold ${feedType === "following" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            onClick={() => setFeedType("following")}
          >
            Following
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg bg-background flex flex-col gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
                <div className="flex gap-6 mt-2">
                  <div className="w-8 h-4 bg-muted rounded"></div>
                  <div className="w-8 h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <p className="text-sm mt-2 text-muted-foreground">Make sure you are signed in.</p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No posts yet.</p>
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
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={handlePostCreated} 
      />
    </>
  );
}
