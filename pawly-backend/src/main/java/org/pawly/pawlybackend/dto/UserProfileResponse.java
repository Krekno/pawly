package org.pawly.pawlybackend.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class UserProfileResponse {
    private UUID id;
    private String username;
    private String bio;
    private String profilePictureUrl;
    private Instant createdAt;
    private int followerCount;
    private int followingCount;
    private boolean isFollowing;
    private List<PostResponse> posts;
}
