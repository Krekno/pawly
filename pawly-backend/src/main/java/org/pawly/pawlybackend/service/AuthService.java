package org.pawly.pawlybackend.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.pawly.pawlybackend.dto.LoginRequest;
import org.pawly.pawlybackend.dto.SignupRequest;
import org.pawly.pawlybackend.dto.UpdateProfileRequest;
import org.pawly.pawlybackend.entity.RefreshToken;
import org.pawly.pawlybackend.entity.User;
import org.pawly.pawlybackend.exception.ResourceNotFoundException;
import org.pawly.pawlybackend.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public void registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }


        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        //user.setRole(Role.ROLE_USER);

        userRepository.save(user);
    }

    public HttpHeaders updateUser(UpdateProfileRequest updateRequest, UserDetailsImpl userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        if (updateRequest.getUsername() != null && !updateRequest.getUsername().isEmpty() && !updateRequest.getUsername().equals(user.getUsername())) {
            user.setUsername(updateRequest.getUsername());
        }
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty() && !updateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                throw new IllegalArgumentException("Email is already in use!");
            }
            user.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty())
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        
        if (updateRequest.getBio() != null)
            user.setBio(updateRequest.getBio());
            
        if (updateRequest.getProfilePictureUrl() != null)
            user.setProfilePictureUrl(updateRequest.getProfilePictureUrl());

        userRepository.save(user);

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user.getEmail());
        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString());

        return headers;
    }

    public HttpHeaders authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        assert userDetails != null;
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails.getEmail());

        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString());

        return headers;
    }

    public HttpHeaders refreshToken(HttpServletRequest request) {
        String refreshToken = jwtUtils.getJwtRefreshFromCookies(request);

        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new IllegalArgumentException("Refresh Token is empty!");
        }

        RefreshToken token = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token is not in database!"));

        refreshTokenService.verifyExpiration(token);
        User user = token.getUser();

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user.getEmail());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        return headers;
    }

    public HttpHeaders logoutUser() {
        Object principle = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        assert principle != null;
        if (!Objects.equals(principle.toString(), "anonymousUser")) {
            UUID userId = ((UserDetailsImpl) principle).getId();
            refreshTokenService.deleteByUserId(userId);
        }

        ResponseCookie jwtCookie = jwtUtils.getCleanJwtCookie();
        ResponseCookie jwtRefreshCookie = jwtUtils.getCleanJwtRefreshCookie();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString());

        return headers;
    }

    public Map<String, Object> getCurrentUser(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("username", user.getUsername());
        res.put("email", user.getEmail());
        res.put("bio", user.getBio());
        res.put("profilePictureUrl", user.getProfilePictureUrl());
        res.put("createdAt", user.getCreatedAt());
        res.put("roles", userDetails.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority).toList());
        return res;
    }
}
