package org.pawly.pawlybackend.repository;

import org.pawly.pawlybackend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    Optional<PostLike> findByPostIdAndUserId(UUID postId, UUID userId);
    int countByPostId(UUID postId);
}
