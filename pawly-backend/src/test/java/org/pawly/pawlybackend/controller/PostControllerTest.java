package org.pawly.pawlybackend.controller;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.pawly.pawlybackend.dto.PostRequest;
import org.pawly.pawlybackend.dto.PostResponse;
import org.pawly.pawlybackend.service.JwtUtils;
import org.pawly.pawlybackend.service.PostService;
import org.pawly.pawlybackend.service.UserDetailsImpl;
import org.pawly.pawlybackend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.context.annotation.Import;
import org.pawly.pawlybackend.config.WebSecurityConfig;

@WebMvcTest(controllers = PostController.class)
@Import(WebSecurityConfig.class)
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PostService postService;

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
    void createPost_ShouldReturnPostResponse() throws Exception {
        PostResponse response = new PostResponse();
        response.setContent("Test content");
        response.setId(UUID.randomUUID());

        Mockito.when(postService.createPost(any(PostRequest.class), eq(testUser.getId())))
                .thenReturn(response);

        String jsonRequest = "{\"content\":\"Test content\"}";

        mockMvc.perform(post("/api/posts")
                        .with(user(testUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Test content"));
    }

    @Test
    void getFeed_ShouldReturnPaginatedPosts() throws Exception {
        PostResponse postResponse = new PostResponse();
        postResponse.setContent("Feed post");
        Page<PostResponse> page = new PageImpl<>(List.of(postResponse));

        Mockito.when(postService.getFeed(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/posts")
                        .with(user(testUser))
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].content").value("Feed post"));
    }

    @Test
    void getPostById_ShouldReturnPost() throws Exception {
        UUID postId = UUID.randomUUID();
        PostResponse response = new PostResponse();
        response.setId(postId);

        Mockito.when(postService.getPostById(postId)).thenReturn(response);

        mockMvc.perform(get("/api/posts/{id}", postId).with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId.toString()));
    }

    @Test
    void likePost_ShouldReturnOk() throws Exception {
        UUID postId = UUID.randomUUID();

        mockMvc.perform(post("/api/posts/{id}/like", postId)
                        .with(user(testUser)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Post liked"));

        Mockito.verify(postService).likePost(postId, testUser.getId());
    }

    @Test
    void deletePost_ShouldReturnOk() throws Exception {
        UUID postId = UUID.randomUUID();

        mockMvc.perform(delete("/api/posts/{id}", postId)
                        .with(user(testUser)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Post deleted successfully"));

        Mockito.verify(postService).deletePost(postId, testUser.getId());
    }
}
