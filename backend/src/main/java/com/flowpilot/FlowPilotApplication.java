package com.flowpilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * FlowPilot AI - Enterprise Workflow Automation Platform.
 *
 * Entry point for the Spring Boot backend. Bootstraps the embedded server,
 * component scanning (com.flowpilot base package) and JPA repositories.
 */
@SpringBootApplication
@EnableAsync
public class FlowPilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlowPilotApplication.class, args);
    }
}
