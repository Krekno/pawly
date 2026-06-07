package org.pawly.pawlybackend.controller;

import lombok.RequiredArgsConstructor;
import org.pawly.pawlybackend.dto.PostRequest;
import org.pawly.pawlybackend.dto.PostResponse;
import org.pawly.pawlybackend.service.PostService;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestBody PostRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        return ResponseEntity.ok(postService.createPost(request, userDetails.getId()));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getFeed(Pageable pageable) {
        return ResponseEntity.ok(postService.getFeed(pageable));
    }

    @GetMapping("/following")
    public ResponseEntity<Page<PostResponse>> getFollowingFeed(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getFollowingFeed(userDetails.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<Page<PostResponse>> getReplies(
            @PathVariable UUID id,
            Pageable pageable) {
        
        return ResponseEntity.ok(postService.getReplies(id, pageable));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        postService.likePost(id, userDetails.getId());
        return ResponseEntity.ok("Post liked");
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        postService.unlikePost(id, userDetails.getId());
        return ResponseEntity.ok("Post unliked");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        postService.deletePost(id, userDetails.getId());
        return ResponseEntity.ok("Post deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPosts(
            @RequestParam String q, Pageable pageable) {
        return ResponseEntity.ok(postService.searchPosts(q, pageable));
    }
}
