package org.pawly.pawlybackend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PostRequest {
    private String content;
    private String imageUrl;
    private UUID parentPostId;
}
