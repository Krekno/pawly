package org.pawly.pawlybackend.service;

import lombok.RequiredArgsConstructor;
import org.pawly.pawlybackend.dto.PostRequest;
import org.pawly.pawlybackend.dto.PostResponse;
import org.pawly.pawlybackend.dto.UserSummaryDto;
import org.pawly.pawlybackend.entity.Post;
import org.pawly.pawlybackend.entity.PostLike;
import org.pawly.pawlybackend.entity.User;
import org.pawly.pawlybackend.exception.ResourceNotFoundException;
import org.pawly.pawlybackend.repository.PostLikeRepository;
import org.pawly.pawlybackend.repository.PostRepository;
import org.pawly.pawlybackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;

    public PostResponse createPost(PostRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());

        if (request.getParentPostId() != null) {
            Post parent = postRepository.findById(request.getParentPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent post not found"));
            post.setParentPost(parent);
        }

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    public Page<PostResponse> getFeed(Pageable pageable) {
        return postRepository.findByParentPostIsNullOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    public Page<PostResponse> getFollowingFeed(UUID userId, Pageable pageable) {
        return postRepository.findFollowingFeed(userId, pageable)
                .map(this::mapToResponse);
    }

    public Page<PostResponse> getPostsByUser(UUID userId, Pageable pageable) {
        return postRepository.findByUserIdAndParentPostIsNullOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public PostResponse getPostById(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return mapToResponse(post);
    }

    public Page<PostResponse> getReplies(UUID postId, Pageable pageable) {
        return postRepository.findByParentPostIdOrderByCreatedAtAsc(postId, pageable)
                .map(this::mapToResponse);
    }

    public void likePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isEmpty()) {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
        }
    }

    public void unlikePost(UUID postId, UUID userId) {
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        existingLike.ifPresent(postLikeRepository::delete);
    }

    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }

        post.setDeleted(true);
        post.setContent(null);
        post.setImageUrl(null);
        postRepository.save(post);
    }

    public Page<PostResponse> searchPosts(String query, Pageable pageable) {
        return postRepository.findByContentContainingIgnoreCaseAndDeletedFalseOrderByCreatedAtDesc(query, pageable)
                .map(this::mapToResponse);
    }

    private PostResponse mapToResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setCreatedAt(post.getCreatedAt());
        response.setDeleted(post.isDeleted());

        if (post.isDeleted()) {
            response.setContent("[Deleted]");
            response.setImageUrl(null);
        } else {
            response.setContent(post.getContent());
            response.setImageUrl(post.getImageUrl());
        }

        if (post.getParentPost() != null) {
            response.setParentPostId(post.getParentPost().getId());
        }

        UserSummaryDto authorDto = new UserSummaryDto(
                post.getUser().getId(),
                post.getUser().getUsername(),
                post.getUser().getProfilePictureUrl()
        );
        response.setAuthor(authorDto);
        response.setLikeCount(postLikeRepository.countByPostId(post.getId()));

        // Map users who liked the post
        List<UserSummaryDto> likedBy = post.getLikes() != null
                ? post.getLikes().stream()
                    .map(like -> new UserSummaryDto(
                            like.getUser().getId(),
                            like.getUser().getUsername(),
                            like.getUser().getProfilePictureUrl()
                    ))
                    .collect(Collectors.toList())
                : Collections.emptyList();
        response.setLikedBy(likedBy);

        // Count replies
        int replyCount = post.getReplies() != null ? post.getReplies().size() : 0;
        response.setReplyCount(replyCount);

        return response;
    }
}
