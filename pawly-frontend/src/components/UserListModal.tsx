"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { UserSummaryDto } from "./PostCard";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserSummaryDto[];
  loading?: boolean;
}

export function UserListModal({ isOpen, onClose, title, users, loading }: UserListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-sm flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <Link href={`/users/${user.username}`} onClick={onClose} className="font-semibold hover:underline flex-1">
                  {user.username}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
