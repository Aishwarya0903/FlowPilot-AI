package com.flowpilot.repository;

import com.flowpilot.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByWorkflowIdOrderByCreatedAtAsc(Long workflowId);
}
