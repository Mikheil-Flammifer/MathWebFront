SPRING_PROFILES_ACTIVE=prod
```

The API CORS setting must contain the exact frontend origin, with no trailing
slash. Both domains must use HTTPS and the same registrable domain so that the
backend's secure `SameSite=Lax` authentication cookies work.

## 3. Build and run the frontend container

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

The container binds only to `127.0.0.1:8081`. Put a TLS reverse proxy in front
of it; do not expose port 8081 directly to the internet.

Example host Nginx virtual host. Replace certificate paths with your real ones:

```nginx
server {
    listen 80;
    server_name app.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate     /etc/nginx/certs/app-fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/app-privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Configure Sentry

Create a browser JavaScript project in Sentry and set its public DSN as
`VITE_SENTRY_DSN`. Keep `SENTRY_AUTH_TOKEN` only as a GitHub Actions secret if
you later upload source maps; it must never be a `VITE_*` variable.

## 5. Configure staging E2E checks

Create a GitHub `staging` environment. Add these protected values:

- Variable: `E2E_APP_URL`
- Variable: `E2E_API_URL`
- Secret: `E2E_EMAIL`
- Secret: `E2E_PASSWORD`

Use a dedicated non-admin test account. The staging workflow verifies login,
cookie-backed session persistence after reload, and logout.
