package com.cms.controller;

import jakarta.validation.Valid;
import com.cms.model.dto.UserDTO;
import com.cms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile() {
        return ResponseEntity.ok(userService.getProfile(getCurrentUserEmail()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(@Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUserEmail(), userDTO));
    }
}
