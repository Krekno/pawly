package org.pawly.pawlybackend.repository;

import org.pawly.pawlybackend.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    Optional<Follow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    int countByFollowerId(UUID followerId);
    int countByFollowingId(UUID followingId);
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
}
