package org.pawly.pawlybackend.controller;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.pawly.pawlybackend.dto.LoginRequest;
import org.pawly.pawlybackend.dto.SignupRequest;
import org.pawly.pawlybackend.service.AuthService;
import org.pawly.pawlybackend.service.JwtUtils;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.pawly.pawlybackend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.context.annotation.Import;
import org.pawly.pawlybackend.config.WebSecurityConfig;

@WebMvcTest(controllers = AuthController.class)
@Import(WebSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtUtils jwtUtils;



    private UserDetailsImpl testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserDetailsImpl(
                UUID.randomUUID(),
                "testuser",
                "test@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void registerUser_ShouldReturnOk() throws Exception {
        String jsonRequest = "{\"username\":\"newuser\", \"email\":\"new@example.com\", \"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully!"));

        Mockito.verify(authService).registerUser(any(SignupRequest.class));
    }

    @Test
    void registerUser_ShouldFailValidation() throws Exception {
        String jsonRequest = "{\"email\":\"invalid\", \"password\":\"123\"}";

        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest()); // 400 Bad Request due to @Valid
    }

    @Test
    void authenticateUser_ShouldReturnHeaders() throws Exception {
        String jsonRequest = "{\"email\":\"test@example.com\", \"password\":\"password\"}";

        HttpHeaders mockHeaders = new HttpHeaders();
        mockHeaders.add(HttpHeaders.SET_COOKIE, "jwt-cookie=value");

        Mockito.when(authService.authenticateUser(any(LoginRequest.class))).thenReturn(mockHeaders);

        mockMvc.perform(post("/api/auth/signin")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(content().string("User signed in successfully!"));
    }

    @Test
    void getMe_ShouldReturnProfile() throws Exception {
        Map<String, Object> mockProfile = new HashMap<>();
        mockProfile.put("username", "testuser");
        mockProfile.put("email", "test@example.com");

        Mockito.when(authService.getCurrentUser(any(UserDetailsImpl.class))).thenReturn(mockProfile);

        mockMvc.perform(get("/api/auth/me")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }
}
