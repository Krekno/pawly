package org.pawly.pawlybackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pawly.pawlybackend.dto.LoginRequest;
import org.pawly.pawlybackend.dto.SignupRequest;
import org.pawly.pawlybackend.dto.UpdateProfileRequest;
import org.pawly.pawlybackend.service.AuthService;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        authService.registerUser(signupRequest);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PatchMapping("/update")
    ResponseEntity<?> updateUser(@Valid @RequestBody UpdateProfileRequest updateRequest, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HttpHeaders headers = authService.updateUser(updateRequest, userDetails);
        return ResponseEntity.ok()
                .headers(headers)
                .body("User updated successfully!");
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        HttpHeaders headers = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok()
                .headers(headers)
                .body("User signed in successfully!");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
        HttpHeaders headers = authService.refreshToken(request);
        return ResponseEntity.ok()
                .headers(headers)
                .body("Token is refreshed successfully!");
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        HttpHeaders headers = authService.logoutUser();
        return ResponseEntity.ok()
                .headers(headers)
                .body("You've been signed out!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        Map<String, Object> res = authService.getCurrentUser(userDetails);
        return ResponseEntity.ok(res);
    }
}
