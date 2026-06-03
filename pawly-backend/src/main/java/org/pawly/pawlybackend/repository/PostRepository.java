package org.pawly.pawlybackend.repository;

import org.pawly.pawlybackend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByParentPostIsNullOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByParentPostIdOrderByCreatedAtAsc(UUID parentId, Pageable pageable);
    Page<Post> findByUserIdAndParentPostIsNullOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Post> findByContentContainingIgnoreCaseAndDeletedFalseOrderByCreatedAtDesc(String content, Pageable pageable);
}
