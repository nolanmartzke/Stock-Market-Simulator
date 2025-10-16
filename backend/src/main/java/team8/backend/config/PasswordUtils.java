package team8.backend.config;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class PasswordUtils {

     // Hash password with salt (BCrypt automatically generates a salt)
    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12)); // 12 = work factor
    }

    // Verify password against stored hash
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
    
}
