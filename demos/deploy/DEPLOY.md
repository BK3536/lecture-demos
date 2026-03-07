# Deploying labs.remilab.ai on remilab-r02

## Overview

Static nginx container serving lecture demos at `labs.remilab.ai`.
Port: `8092` (localhost only, exposed via Cloudflare Tunnel).

## Step 1: Copy files to remilab-r02

```bash
# From workspace (or the demos are already on NFS)
# NFS path: /mnt/nfs_share/personal-workspaces/byungkwan-workspace/teaching/lecture/demos

# Copy deploy configs to obsidian-stack
ssh remilab-r02
cd /path/to/remilab-obsidian-gitops/deploy/obsidian-stack
```

### Option A: Merge into obsidian-stack (recommended)

Copy the compose override and nginx config:

```bash
cp /mnt/nfs_share/personal-workspaces/byungkwan-workspace/teaching/lecture/demos/deploy/docker-compose.labs.yml .
cp /mnt/nfs_share/personal-workspaces/byungkwan-workspace/teaching/lecture/demos/deploy/nginx-labs.conf .
```

Start with the existing stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.labs.yml up -d labs-static
```

### Option B: Standalone

```bash
cd /mnt/nfs_share/personal-workspaces/byungkwan-workspace/teaching/lecture/demos/deploy
docker compose -f docker-compose.labs.yml up -d
```

## Step 2: Verify container

```bash
docker ps | grep remilab-labs
curl -s http://127.0.0.1:8092/ | head -5   # Should show index.html
curl -s http://127.0.0.1:8092/signals-and-systems/01-sinusoidal.html | head -5
```

## Step 3: Update host nginx (if not using Cloudflare Tunnel directly)

Add `labs.remilab.ai` to the nginx host map in `obsidian-remilab-ai.conf`:

```nginx
map $host $obsidian_upstream {
    default          127.0.0.1:8088;  # remilab.ai (public viewer)
    wiki.remilab.ai  127.0.0.1:8090;  # wiki.remilab.ai (internal viewer)
    edit.remilab.ai  127.0.0.1:8089;  # edit.remilab.ai (editor)
    labs.remilab.ai  127.0.0.1:8092;  # labs.remilab.ai (lecture demos)  <-- ADD
}

server {
    ...
    server_name remilab.ai wiki.remilab.ai edit.remilab.ai labs.remilab.ai;  # <-- ADD
    ...
}
```

Then reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Step 4: Cloudflare DNS + Tunnel

### 4a. DNS Record (Cloudflare Dashboard)

1. Go to **Cloudflare Dashboard** > **remilab.ai** domain > **DNS**
2. Add CNAME record:
   - **Name:** `labs`
   - **Target:** same tunnel CNAME as other subdomains (e.g., `<tunnel-id>.cfargotunnel.com`)
   - **Proxy status:** Proxied (orange cloud)

### 4b. Tunnel Ingress (Zero Trust Dashboard)

Since the tunnel uses **token mode**, ingress is configured in the dashboard:

1. Go to **Cloudflare Zero Trust** > **Networks** > **Tunnels**
2. Select the `remilab-obsidian` tunnel > **Configure**
3. Go to **Public Hostname** tab
4. Click **Add a public hostname**:
   - **Subdomain:** `labs`
   - **Domain:** `remilab.ai`
   - **Service type:** `HTTP`
   - **URL:** `remilab-labs:80` (if in same compose network) or `host.docker.internal:8092`

   > If labs-static is in the same Docker network as cloudflared, use the container name `remilab-labs:80`.
   > Otherwise, use `127.0.0.1:8092` (requires `network_mode: host` on cloudflared or host networking).

5. Save

### 4c. Connect labs-static to cloudflared network

If using the obsidian-stack compose merge (Option A), add labs-static to the default network so cloudflared can reach it. This happens automatically since both services are in the same compose project.

If standalone, add an external network:

```yaml
# In docker-compose.labs.yml, add:
services:
  labs-static:
    networks:
      - default
      - obsidian-stack

networks:
  obsidian-stack:
    external: true
    name: obsidian-stack_default
```

## Step 5: Verify end-to-end

```bash
curl -sI https://labs.remilab.ai/
# Should return 200 OK

# Check a demo loads
curl -s https://labs.remilab.ai/signals-and-systems/01-sinusoidal.html | head -3
```

## Updating content

The demos are served from NFS. To update:

```bash
# Edit files in workspace (this directory)
# They are immediately available via NFS mount — no rebuild needed
# Force nginx cache clear if needed:
docker exec remilab-labs nginx -s reload
```
