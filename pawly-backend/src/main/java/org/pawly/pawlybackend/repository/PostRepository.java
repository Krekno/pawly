package org.pawly.pawlybackend.repository;

import org.pawly.pawlybackend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByParentPostIsNullOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE (p.user.id = :userId OR p.user IN (SELECT f.following FROM Follow f WHERE f.follower.id = :userId)) AND p.parentPost IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findFollowingFeed(@Param("userId") UUID userId, Pageable pageable);

    Page<Post> findByParentPostIdOrderByCreatedAtAsc(UUID parentId, Pageable pageable);
    Page<Post> findByUserIdAndParentPostIsNullOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Post> findByContentContainingIgnoreCaseAndDeletedFalseOrderByCreatedAtDesc(String content, Pageable pageable);
}
