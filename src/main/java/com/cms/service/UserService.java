package com.cms.service;

import com.cms.model.dto.UserDTO;

public interface UserService {

    UserDTO getProfile(String email);

    UserDTO updateProfile(String email, UserDTO dto);
}
