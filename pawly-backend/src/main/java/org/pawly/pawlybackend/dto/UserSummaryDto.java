package org.pawly.pawlybackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private UUID id;
    private String username;
    private String profilePictureUrl;
}
