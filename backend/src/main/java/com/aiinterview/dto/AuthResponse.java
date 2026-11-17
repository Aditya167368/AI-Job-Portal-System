package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private String userId;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private int eloRating;
    private String rankingTier;
    private String preferredLanguage;
}
