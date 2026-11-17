package com.aiinterview.repository;

import com.aiinterview.model.UserPerformanceProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPerformanceProfileRepository extends MongoRepository<UserPerformanceProfile, String> {

    Optional<UserPerformanceProfile> findByUserId(String userId);

    Boolean existsByUserId(String userId);

    List<UserPerformanceProfile> findTop10ByOrderByEloRatingDesc();
}
