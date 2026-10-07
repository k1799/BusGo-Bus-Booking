package com.busgo.busbooking.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    // JWT create + validate செய்ய same secret key பயன்படுத்த வேண்டும்
    private final String secretKey = "BusGoSecretKeyForJwtAuthentication2026BusBooking";

    // Secret key create செய்யும் method
    private SecretKey getKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // JWT Token generate
    public String generateToken(String email, String role) {

        return Jwts.builder()

                // User email
                .subject(email)

                // User role
                .claim("role", role)

                // Token created time
                .issuedAt(new Date())

                // Token expiry - 1 hour
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60))

                // Secret key வைத்து sign
                .signWith(getKey())

                // Final JWT string
                .compact();
    }

    // JWT-ல் இருந்து email எடுக்க
    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // JWT valid-ஆ இருக்கிறதா check செய்ய
    public boolean isTokenValid(String token) {

        try {

            Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    public String extractRole(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }
}
