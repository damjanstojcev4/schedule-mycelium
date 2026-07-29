package com.damjan.scheduler_mycelium.domain.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface GoogleCalendarTokenRepository extends JpaRepository<GoogleCalendarToken, Long> {

    Optional<GoogleCalendarToken> findByAccountId(Long accountId);

    boolean existsByAccountId(Long accountId);

    @Transactional
    void deleteByAccountId(Long accountId);
}
