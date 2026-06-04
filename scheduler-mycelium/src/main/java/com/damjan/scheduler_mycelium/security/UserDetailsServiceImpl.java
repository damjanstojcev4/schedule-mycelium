package com.damjan.scheduler_mycelium.security;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + account.getRole().name());

        return new CustomUserDetails(
                account.getId(),
                account.getEmail(),
                account.getPasswordHash(),
                Collections.singletonList(authority)
        );
    }

    @Getter
    @RequiredArgsConstructor
    public static class CustomUserDetails implements UserDetails {
        private final Long accountId;
        private final String username;
        private final String password;
        private final Collection<? extends GrantedAuthority> authorities;

        @Override
        public boolean isAccountNonExpired() { return true; }
        @Override
        public boolean isAccountNonLocked() { return true; }
        @Override
        public boolean isCredentialsNonExpired() { return true; }
        @Override
        public boolean isEnabled() { return true; }
    }
}
