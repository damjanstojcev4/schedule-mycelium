package com.damjan.scheduler_mycelium.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * AES-256 symmetric encryption utility for Google OAuth tokens.
 * <p>
 * Uses AES/ECB/PKCS5Padding.  ECB is acceptable here because each token is
 * individually encrypted with a 256-bit key and the data is not stream-like
 * (no chosen-plaintext patterns to exploit).
 * <p>
 * If {@code GOOGLE_TOKEN_ENCRYPTION_KEY} is blank (local dev without Google
 * credentials), encrypt/decrypt are pass-through no-ops so the app still starts.
 */
@Component
@Slf4j
public class TokenEncryptionUtil {

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";

    private final SecretKeySpec secretKey;
    private final boolean enabled;

    public TokenEncryptionUtil(
            @Value("${google.calendar.token-encryption-key:}") String hexKey) {
        if (hexKey == null || hexKey.isBlank()) {
            log.warn("GOOGLE_TOKEN_ENCRYPTION_KEY is not set — token encryption disabled. " +
                     "Generate one with: openssl rand -hex 32");
            this.secretKey = null;
            this.enabled = false;
        } else {
            byte[] keyBytes = hexStringToByteArray(hexKey);
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
            this.enabled = true;
        }
    }

    public String encrypt(String plainText) {
        if (!enabled) return plainText;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt token", e);
        }
    }

    public String decrypt(String encryptedText) {
        if (!enabled) return encryptedText;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt token", e);
        }
    }

    private static byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
