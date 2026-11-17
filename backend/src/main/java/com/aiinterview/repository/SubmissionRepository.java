package com.aiinterview.repository;

import com.aiinterview.model.Submission;
import com.aiinterview.model.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {

    List<Submission> findByUserId(String userId);

    Page<Submission> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Submission> findTop10ByUserIdOrderByCreatedAtDesc(String userId);

    List<Submission> findByUserIdAndQuestionId(String userId, String questionId);

    List<Submission> findByQuestionId(String questionId);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, SubmissionStatus status);
}
