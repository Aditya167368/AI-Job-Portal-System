package com.aiinterview.service;

import com.aiinterview.config.JwtTokenProvider;
import com.aiinterview.dto.AuthResponse;
import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.SignupRequest;
import com.aiinterview.dto.UserProfileDto;
import com.aiinterview.model.Role;
import com.aiinterview.model.User;
import com.aiinterview.model.UserPerformanceProfile;
import com.aiinterview.repository.UserPerformanceProfileRepository;
import com.aiinterview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserPerformanceProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered!");
        }

        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : request.getUsername())
                .roles(roles)
                .targetCompanies(request.getTargetCompanies() != null ? request.getTargetCompanies() : List.of("Google", "Amazon", "Meta"))
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "javascript")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        // Initialize user performance profile
        UserPerformanceProfile profile = UserPerformanceProfile.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .eloRating(1200)
                .peakRating(1200)
                .updatedAt(Instant.now())
                .build();
        profileRepository.save(profile);

        List<String> roleNames = savedUser.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getUsername(), roleNames);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .roles(roleNames)
                .eloRating(profile.getEloRating())
                .rankingTier(profile.getRankingTier().name())
                .preferredLanguage(savedUser.getPreferredLanguage())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        UserPerformanceProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserPerformanceProfile newProfile = UserPerformanceProfile.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .eloRating(1200)
                            .peakRating(1200)
                            .build();
                    return profileRepository.save(newProfile);
                });

        List<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), roleNames);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roleNames)
                .eloRating(profile.getEloRating())
                .rankingTier(profile.getRankingTier().name())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserPerformanceProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserPerformanceProfile.builder()
                        .userId(userId)
                        .eloRating(1200)
                        .peakRating(1200)
                        .build());

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles())
                .targetCompanies(user.getTargetCompanies())
                .preferredLanguage(user.getPreferredLanguage())
                .eloRating(profile.getEloRating())
                .peakRating(profile.getPeakRating())
                .rankingTier(profile.getRankingTier())
                .totalSolved(profile.getTotalSolved())
                .easySolved(profile.getEasySolved())
                .mediumSolved(profile.getMediumSolved())
                .hardSolved(profile.getHardSolved())
                .totalSubmissions(profile.getTotalSubmissions())
                .acceptanceRate(profile.getAcceptanceRate())
                .currentStreak(profile.getCurrentStreak())
                .longestStreak(profile.getLongestStreak())
                .topicMastery(profile.getTopicMastery())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
