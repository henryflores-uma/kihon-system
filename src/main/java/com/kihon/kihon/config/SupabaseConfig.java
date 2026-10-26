package com.kihon.kihon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String url;

    @Value("${supabase.secret-key}")
    private String secretKey;

    public String getUrl() {
        return url;
    }

    public String getSecretKey() {
        return secretKey;
    }
}