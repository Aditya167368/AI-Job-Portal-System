package com.aiinterview.repository;

import com.aiinterview.model.Difficulty;
import com.aiinterview.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {

    Optional<Question> findBySlug(String slug);

    Page<Question> findByDifficulty(Difficulty difficulty, Pageable pageable);

    @Query("{ 'topics': { $regex: ?0, $options: 'i' } }")
    Page<Question> findByTopic(String topic, Pageable pageable);

    @Query("{ 'companies': { $regex: ?0, $options: 'i' } }")
    Page<Question> findByCompany(String company, Pageable pageable);

    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'descriptionMarkdown': { $regex: ?0, $options: 'i' } }, { 'topics': { $regex: ?0, $options: 'i' } } ] }")
    Page<Question> searchByKeyword(String keyword, Pageable pageable);

    List<Question> findByDifficulty(Difficulty difficulty);

    List<Question> findTop10ByOrderByCreatedAtDesc();
}
