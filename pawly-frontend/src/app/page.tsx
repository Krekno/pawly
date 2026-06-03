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

  useEffect(() => {
    async function loadFeed() {
      try {
        const [feedRes, meRes] = await Promise.all([
          postApi.getFeed(),
          authApi.getMe().catch(() => null)
        ]);
        
        setCurrentUser(meRes);

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
  }, []);

  const handlePostCreated = (newPost: PostResponse) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedId));
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading feed...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <p className="text-sm mt-2 text-muted-foreground">Make sure you are signed in.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <Button onClick={() => setIsModalOpen(true)}>New Post</Button>
        </div>

        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
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
