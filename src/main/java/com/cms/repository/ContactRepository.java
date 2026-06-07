package com.cms.repository;

import com.cms.model.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

        Page<Contact> findByUserId(Long userId, Pageable pageable);

        @Query("SELECT DISTINCT c FROM Contact c LEFT JOIN c.emails e WHERE c.user.id = :userId AND " +
                        "(LOWER(c.firstName) LIKE LOWER(CONCAT('%',:k,'%')) OR " +
                        "LOWER(c.lastName) LIKE LOWER(CONCAT('%',:k,'%')) OR " +
                        "LOWER(c.title) LIKE LOWER(CONCAT('%',:k,'%')) OR " +
                        "LOWER(e.email) LIKE LOWER(CONCAT('%',:k,'%')))")
        Page<Contact> searchContacts(
                        @Param("userId") Long userId,
                        @Param("k") String keyword,
                        Pageable pageable);
}
