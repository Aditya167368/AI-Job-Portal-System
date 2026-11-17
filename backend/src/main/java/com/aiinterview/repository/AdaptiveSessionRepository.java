package com.aiinterview.repository;

import com.aiinterview.model.AdaptiveSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdaptiveSessionRepository extends MongoRepository<AdaptiveSession, String> {

    List<AdaptiveSession> findByUserIdOrderByStartTimeDesc(String userId);

    Optional<AdaptiveSession> findFirstByUserIdAndStatusOrderByStartTimeDesc(String userId, String status);
}
