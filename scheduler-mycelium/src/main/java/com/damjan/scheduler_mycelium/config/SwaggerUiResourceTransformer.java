package com.damjan.scheduler_mycelium.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.resource.ResourceTransformer;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Appends project CSS to the Swagger UI bundle so layout fixes apply without a separate auth path.
 */
@Component
public class SwaggerUiResourceTransformer implements ResourceTransformer {

    private final byte[] overrideCss;

    public SwaggerUiResourceTransformer() throws IOException {
        try (var in = new ClassPathResource("static/css/swagger-overrides.css").getInputStream()) {
            this.overrideCss = StreamUtils.copyToByteArray(in);
        }
    }

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, ResourceTransformerChain chain)
            throws IOException {
        Resource transformed = chain.transform(request, resource);
        String url = resource.getURL().toString();

        if (url.contains("swagger-ui.css")) {
            byte[] original = StreamUtils.copyToByteArray(transformed.getInputStream());
            byte[] combined = new byte[original.length + overrideCss.length];
            System.arraycopy(original, 0, combined, 0, original.length);
            System.arraycopy(overrideCss, 0, combined, original.length, overrideCss.length);
            return new TransformedResource(transformed, combined);
        }

        if (url.contains("swagger-ui") && url.endsWith("index.html")) {
            String html = StreamUtils.copyToString(transformed.getInputStream(), StandardCharsets.UTF_8);
            String link = "<link rel=\"stylesheet\" type=\"text/css\" href=\"/css/swagger-overrides.css\">";
            if (!html.contains("swagger-overrides.css")) {
                html = html.replace("</head>", link + "\n</head>");
                return new TransformedResource(transformed, html.getBytes(StandardCharsets.UTF_8));
            }
        }

        return transformed;
    }
}
