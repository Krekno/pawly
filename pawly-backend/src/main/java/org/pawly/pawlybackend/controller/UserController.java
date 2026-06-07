package org.pawly.pawlybackend.controller;

import lombok.RequiredArgsConstructor;
import org.pawly.pawlybackend.dto.UserProfileResponse;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.pawly.pawlybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(userService.getUserProfile(username, currentUserId));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        userService.followUser(id, userDetails.getId());
        return ResponseEntity.ok("Successfully followed user");
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        userService.unfollowUser(id, userDetails.getId());
        return ResponseEntity.ok("Successfully unfollowed user");
    }

    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<org.pawly.pawlybackend.dto.UserSummaryDto>> searchUsers(
            @RequestParam String q, org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(q, pageable));
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<org.springframework.data.domain.Page<org.pawly.pawlybackend.dto.UserSummaryDto>> getFollowers(
            @PathVariable String username, org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowers(username, pageable));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<org.springframework.data.domain.Page<org.pawly.pawlybackend.dto.UserSummaryDto>> getFollowing(
            @PathVariable String username, org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowing(username, pageable));
    }
}
