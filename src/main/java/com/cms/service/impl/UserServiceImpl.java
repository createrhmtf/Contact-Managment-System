package com.cms.service.impl;

import com.cms.exception.ResourceNotFoundException;
import com.cms.model.dto.UserDTO;
import com.cms.model.entity.User;
import com.cms.repository.UserRepository;
import com.cms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        log.info("Profile fetched for: {}", email);
        return mapToUserDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateProfile(String email, UserDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        User savedUser = userRepository.save(user);
        log.info("Profile updated for: {}", email);
        return mapToUserDTO(savedUser);
    }

    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
