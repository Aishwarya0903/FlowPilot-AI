package com.flowpilot.security;

import com.flowpilot.entity.User;
import com.flowpilot.entity.enums.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktZG8tbm90LXVzZS1pbi1wcm9k");
        ReflectionTestUtils.setField(jwtUtil, "accessTokenExpirationMs", 3600000L);

        testUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@flowpilot.ai")
                .password("hashed")
                .role(RoleName.EMPLOYEE)
                .enabled(true)
                .build();
    }

    @Test
    void generatesAndValidatesTokenSuccessfully() {
        String token = jwtUtil.generateToken(testUser, Map.of("role", "EMPLOYEE"));

        assertEquals("test@flowpilot.ai", jwtUtil.extractUsername(token));
        assertTrue(jwtUtil.isTokenValid(token, testUser));
    }
}
