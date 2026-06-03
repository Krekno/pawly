package org.pawly.pawlybackend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.pawly.pawlybackend.dto.UserProfileResponse;
import org.pawly.pawlybackend.service.JwtUtils;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.pawly.pawlybackend.service.UserDetailsServiceImpl;
import org.pawly.pawlybackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.context.annotation.Import;
import org.pawly.pawlybackend.config.WebSecurityConfig;

@WebMvcTest(controllers = UserController.class)
@Import(WebSecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

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
    void getUserProfile_ShouldReturnProfile() throws Exception {
        String targetUsername = "targetuser";
        UserProfileResponse response = new UserProfileResponse();
        response.setUsername(targetUsername);
        response.setFollowerCount(10);

        Mockito.when(userService.getUserProfile(eq(targetUsername), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/users/{username}", targetUsername)
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(targetUsername))
                .andExpect(jsonPath("$.followerCount").value(10));
    }

    @Test
    void followUser_ShouldReturnOk() throws Exception {
        UUID targetId = UUID.randomUUID();

        mockMvc.perform(post("/api/users/{id}/follow", targetId)
                        .with(user(testUser)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Successfully followed user"));

        Mockito.verify(userService).followUser(targetId, testUser.getId());
    }

    @Test
    void unfollowUser_ShouldReturnOk() throws Exception {
        UUID targetId = UUID.randomUUID();

        mockMvc.perform(delete("/api/users/{id}/follow", targetId)
                        .with(user(testUser)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Successfully unfollowed user"));

        Mockito.verify(userService).unfollowUser(targetId, testUser.getId());
    }
}
