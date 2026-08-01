package com.flowpilot.service;

import com.flowpilot.dto.UserSummaryResponse;
import com.flowpilot.entity.User;
import com.flowpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserSummaryResponse> getAll() {
        return userRepository.findAll().stream().map(this::toSummary).toList();
    }

    private UserSummaryResponse toSummary(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                .build();
    }
}
