package com.flowpilot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test: verifies the full Spring application context (security,
 * JPA, controllers) wires up correctly against an in-memory H2 database.
 */
@SpringBootTest
@ActiveProfiles("test")
class FlowPilotApplicationTests {

    @Test
    void contextLoads() {
        // If the Spring context fails to start, this test fails automatically.
    }
}
