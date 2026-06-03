# API Endpoints Documentation

This document outlines all the available API endpoints in the `pawly-backend` application, detailing their HTTP methods, paths, and the exact structure of the objects they return.

## 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Returns | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | `String` | Returns `"User registered successfully!"` |
| `PATCH` | `/api/auth/update` | `String` | Returns `"User updated successfully!"` (Includes updated auth headers) |
| `POST` | `/api/auth/signin` | `String` | Returns `"User signed in successfully!"` (Includes auth headers) |
| `POST` | `/api/auth/refresh` | `String` | Returns `"Token is refreshed successfully!"` (Includes refreshed auth headers) |
| `POST` | `/api/auth/signout` | `String` | Returns `"You've been signed out!"` (Includes cleared auth headers) |
| `GET` | `/api/auth/me` | `Map<String, Object>` | Returns a map containing the current authenticated user's details. Returns `401 Unauthorized` if unauthenticated. |

---

## 📝 Posts (`/api/posts`)

| Method | Endpoint | Returns | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | [`PostResponse`](#postresponse-dto) | Returns the newly created post. |
| `GET` | `/api/posts` | `Page<PostResponse>` | Returns a paginated feed of posts. |
| `GET` | `/api/posts/{id}` | [`PostResponse`](#postresponse-dto) | Returns a specific post by its UUID. |
| `GET` | `/api/posts/{id}/replies` | `Page<PostResponse>` | Returns a paginated list of replies to a specific post. |
| `GET` | `/api/posts/search?q={query}` | `Page<PostResponse>` | Returns a paginated list of posts matching the search query. |
| `POST` | `/api/posts/{id}/like` | `String` | Returns `"Post liked"` |
| `DELETE`| `/api/posts/{id}/like` | `String` | Returns `"Post unliked"` |
| `DELETE`| `/api/posts/{id}` | `String` | Returns `"Post deleted successfully"` |

---

## 👤 Users (`/api/users`)

| Method | Endpoint | Returns | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/search?q={query}` | `Page<UserSummaryDto>` | Returns a paginated list of users whose usernames match the search query. |
| `GET` | `/api/users/{username}` | [`UserProfileResponse`](#userprofileresponse-dto) | Returns the profile details for the specified username. |
| `POST` | `/api/users/{id}/follow` | `String` | Returns `"Successfully followed user"` |
| `DELETE`| `/api/users/{id}/follow` | `String` | Returns `"Successfully unfollowed user"` |

---

## 📦 Data Transfer Objects (DTOs)

Below are the detailed structures of the DTOs returned by the endpoints.

### `PostResponse` DTO
Represents a single post or reply.

```json
{
  "id": "UUID",
  "content": "String",
  "imageUrl": "String",
  "createdAt": "Instant",
  "author": {
    "id": "UUID",
    "username": "String",
    "profilePictureUrl": "String"
  },
  "likeCount": "int",
  "replyCount": "int",
  "parentPostId": "UUID",
  "deleted": "boolean"
}
```
*(Note: The `author` field is represented by a `UserSummaryDto`)*

### `UserProfileResponse` DTO
Represents the public profile information of a user.

```json
{
  "id": "UUID",
  "username": "String",
  "bio": "String",
  "profilePictureUrl": "String",
  "createdAt": "Instant",
  "followerCount": "int",
  "followingCount": "int",
  "isFollowing": "boolean"
}
```
