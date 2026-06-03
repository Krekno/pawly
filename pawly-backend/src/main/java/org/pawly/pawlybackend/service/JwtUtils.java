package org.pawly.pawlybackend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${app.jwt.jwtCookieName}")
    private String jwtCookie;

    @Value("${app.jwt.jwtRefreshCookieName}")
    private String jwtRefreshCookie;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public ResponseCookie generateJwtCookie(String email) {
        String jwt = generateTokenFromEmail(email);
        return ResponseCookie.from(jwtCookie, jwt)
                .path("/")
                .maxAge(jwtExpirationMs / 1000) // seconds
                .httpOnly(true)
                .secure(true) // Required for SameSite=None
                .sameSite("None")
                .build();
    }

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        return ResponseCookie.from(jwtRefreshCookie, refreshToken)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookie, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public ResponseCookie getCleanJwtRefreshCookie() {
        return ResponseCookie.from(jwtRefreshCookie, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtCookie);
    }

    public String getJwtRefreshFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtRefreshCookie);
    }

    private String getCookieValueByName(HttpServletRequest request, String name) {
        Cookie cookie = WebUtils.getCookie(request, name);
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    public String generateTokenFromEmail(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log exception details
        }
        return false;
    }
}
