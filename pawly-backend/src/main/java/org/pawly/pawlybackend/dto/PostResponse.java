package org.pawly.pawlybackend.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PostResponse {
    private UUID id;
    private String content;
    private String imageUrl;
    private Instant createdAt;
    private UserSummaryDto author;
    private int likeCount;
    private List<UserSummaryDto> likedBy;
    private int replyCount;
    private UUID parentPostId;
    private boolean deleted;
}
