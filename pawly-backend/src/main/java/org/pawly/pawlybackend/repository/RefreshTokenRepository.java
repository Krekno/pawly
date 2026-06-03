package org.pawly.pawlybackend.repository;

import org.pawly.pawlybackend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import org.pawly.pawlybackend.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}
