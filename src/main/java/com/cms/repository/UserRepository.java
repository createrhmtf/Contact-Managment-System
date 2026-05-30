package com.cms.repository;

import com.cms.model.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phone);
}
