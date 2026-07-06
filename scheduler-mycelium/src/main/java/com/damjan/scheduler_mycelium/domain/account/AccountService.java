package com.damjan.scheduler_mycelium.domain.account;

import com.damjan.scheduler_mycelium.admin.dto.AdminAccountResponseDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.AuthResponseDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.LoginRequestDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.RegisterRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.customer.Customer;
import com.damjan.scheduler_mycelium.domain.customer.CustomerRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.exception.UnauthorizedException;
import com.damjan.scheduler_mycelium.security.JwtUtil;
import com.damjan.scheduler_mycelium.webhook.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WebhookService webhookService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(Account.Role.valueOf(request.getRole()));

        account = accountRepository.save(account);

        if (account.getRole() == Account.Role.CUSTOMER) {
            Customer customer = new Customer();
            customer.setAccount(account);
            // Use the submitted fullName if provided, otherwise fall back to email prefix
            String name = (request.getFullName() != null && !request.getFullName().isBlank())
                    ? request.getFullName().trim()
                    : request.getEmail().split("@")[0];
            customer.setFullName(name);
            customerRepository.save(customer);
        }

        String token = jwtUtil.generateToken(account);
        String slug = resolveSlug(account);
        UUID businessPublicId = resolveBusinessPublicId(account);
        String fullName = resolveFullName(account);

        return new AuthResponseDTO(
                token,
                account.getPublicId(),
                account.getEmail(),
                fullName,
                account.getRole().name(),
                slug,
                businessPublicId
        );
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(account);
        String slug = resolveSlug(account);
        UUID businessPublicId = resolveBusinessPublicId(account);
        String fullName = resolveFullName(account);

        return new AuthResponseDTO(
                token,
                account.getPublicId(),
                account.getEmail(),
                fullName,
                account.getRole().name(),
                slug,
                businessPublicId
        );
    }

    /**
     * Resolves the business slug for roles that need it.
     * BUSINESS_OWNER → their business slug
     * STAFF → the business slug of the business they belong to
     * Others → null
     */
    private String resolveSlug(Account account) {
        if (account.getRole() == Account.Role.BUSINESS_OWNER) {
            return businessRepository.findByOwnerId(account.getId())
                    .stream()
                    .findFirst()
                    .map(Business::getSlug)
                    .orElse(null);
        }
        if (account.getRole() == Account.Role.STAFF) {
            return staffMemberRepository.findByAccountId(account.getId())
                    .map(StaffMember::getBusiness)
                    .map(Business::getSlug)
                    .orElse(null);
        }
        return null;
    }

    private UUID resolveBusinessPublicId(Account account) {
        if (account.getRole() == Account.Role.BUSINESS_OWNER) {
            return businessRepository.findByOwnerId(account.getId())
                    .stream()
                    .findFirst()
                    .map(Business::getPublicId)
                    .orElse(null);
        }
        if (account.getRole() == Account.Role.STAFF) {
            return staffMemberRepository.findByAccountId(account.getId())
                    .map(StaffMember::getBusiness)
                    .map(Business::getPublicId)
                    .orElse(null);
        }
        return null;
    }

    /**
     * Returns the Customer's fullName for CUSTOMER-role accounts; null for all other roles.
     */
    private String resolveFullName(Account account) {
        if (account.getRole() == Account.Role.CUSTOMER) {
            return customerRepository.findByAccountId(account.getId())
                    .map(Customer::getFullName)
                    .orElse(null);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<AdminAccountResponseDTO> getAllAccountsForAdmin() {
        return accountRepository.findAll().stream()
                .map(account -> new AdminAccountResponseDTO(
                        account.getPublicId(),
                        account.getEmail(),
                        account.getRole().name(),
                        account.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void generatePasswordResetToken(String email) {
        accountRepository.findByEmail(email).ifPresent(account -> {
            String token = UUID.randomUUID().toString();
            account.setResetToken(token);
            account.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            accountRepository.save(account);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            webhookService.sendPasswordResetLink(account, resetLink);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        Account account = accountRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (account.getResetTokenExpiry() == null || account.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setResetToken(null);
        account.setResetTokenExpiry(null);
        accountRepository.save(account);
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));

        if (!passwordEncoder.matches(oldPassword, account.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect old password");
        }

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }
}
