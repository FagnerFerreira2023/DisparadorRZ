import pexpect
import sys

def run_command_as_root(password, command):
    print(f"Running command: {command}")
    child = pexpect.spawn(f"su -c '{command}'")
    try:
        index = child.expect(['Password:', 'senha:', pexpect.EOF, pexpect.TIMEOUT])
        if index <= 1:
            child.sendline(password)
            child.expect(pexpect.EOF)
            print(child.before.decode())
        else:
            print("Failed to get password prompt")
            print(child.before.decode())
    except Exception as e:
        print(f"Error: {e}")
        print(child.before.decode())

if __name__ == "__main__":
    pwd = "FG@3005aysb-FG@3005aysb"
    
    # Define commands
    nginx_conf = """
server {
    listen 80;
    server_name disparador.reidozap.com.br;

    location / {
        proxy_pass http://172.17.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""
    
    # 1. Create Nginx config
    run_command_as_root(pwd, f'echo "{nginx_conf}" > /etc/nginx/sites-available/disparador.reidozap.com.br.conf')
    
    # 2. Enable site
    run_command_as_root(pwd, 'ln -sf /etc/nginx/sites-available/disparador.reidozap.com.br.conf /etc/nginx/sites-enabled/')
    
    # 3. Test and reload Nginx
    run_command_as_root(pwd, 'nginx -t && systemctl reload nginx')
    
    # 4. Certbot SSL
    # Note: Using --non-interactive and --agree-tos. Email is not provided, using --register-unsafely-without-email if needed or just generic.
    # Usually certbot already has details from previous domains.
    run_command_as_root(pwd, 'certbot --nginx -d disparador.reidozap.com.br --non-interactive --agree-tos --register-unsafely-without-email')
