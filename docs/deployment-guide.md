# Guía de Despliegue — Calculadora Kavana

> **Versión:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Público Objetivo:** Equipos de infraestructura, DevOps, Sistemas

---

## 1. Requisitos Previos

### 1.1 Infraestructura Requerida

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| Servidor Web | Cualquier HTTP server | Nginx, Apache, Caddy |
| Almacenamiento | 5 MB | 10 MB |
| Ancho de banda | 100 KB/s | 1 MB/s |
| SSL/TLS | No requerido | Recomendado para PWA |

### 1.2 Compatibilidad de Hosting

| Plataforma | Compatible | Notas |
|------------|------------|-------|
| GitHub Pages | ✅ | Repositorio público o Pro |
| Vercel | ✅ | Despliegue automático desde Git |
| Netlify | ✅ | Despliegue automático |
| Cloudflare Pages | ✅ | CDN global incluido |
| AWS S3 + CloudFront | ✅ | Configurar como sitio estático |
| Nginx | ✅ | Ver configuración abajo |
| Apache | ✅ | Ver configuración abajo |
| IIS | ✅ | Requiere MIME types configurados |

---

## 2. Despliegue en GitHub Pages

### 2.1 Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/kavanasystemsinfo-ui/CalculadoraKavana.git
cd CalculadoraKavana

# 2. Crear rama gh-pages (opcional, puede usar main)
git checkout -b gh-pages

# 3. Push a GitHub
git push -u origin gh-pages
```

### 2.2 Configuración en GitHub

1. Ir a **Settings** > **Pages**
2. Seleccionar **Source**: `Deploy from a branch`
3. Seleccionar rama: `gh-pages` (o `main`)
4. Directorio: `/ (root)`
5. Guardar

### 2.3 Verificación

```bash
# La app estará disponible en:
https://kavanasystemsinfo-ui.github.io/CalculadoraKavana/

# Verificar que funciona:
curl -I https://kavanasystemsinfo-ui.github.io/CalculadoraKavana/index.html
# Debe retornar 200 OK
```

### 2.4 Custom Domain (Opcional)

1. Crear archivo `CNAME` en la raíz del proyecto:
```
calculadora.tudominio.com
```

2. Configurar DNS:
```
Type: CNAME
Name: calculadora
Value: kavanasystemsinfo-ui.github.io
```

3. Habilitar HTTPS en Settings > Pages

---

## 3. Despliegue en Vercel

### 3.1 Desde Dashboard

1. Ir a [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Importar repositorio de GitHub
4. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: (dejar vacío)
   - **Output Directory**: `.`
5. Click **Deploy**

### 3.2 Desde CLI

```bash
# Instalar CLI
npm i -g vercel

# Desplegar
vercel deploy

# Producción
vercel deploy --prod
```

### 3.3 vercel.json (Opcional)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 4. Despliegue en Nginx

### 4.1 Instalación

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 4.2 Configuración

```nginx
# /etc/nginx/sites-available/calculadora

server {
    listen 80;
    server_name calculadora.tudominio.com;
    root /var/www/CalculadoraKavana;
    index index.html;

    # Habilitar gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Rutas principales
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Service Worker - sin caché
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # PWA - Manifest
    location = /manifest.json {
        add_header Content-Type "application/manifest+json";
    }
}
```

### 4.3 Activar Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/calculadora /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 4.4 HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d calculadora.tudominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

---

## 5. Despliegue en Apache

### 5.1 Configuración

```apache
# /etc/apache2/sites-available/calculadora.conf

<VirtualHost *:80>
    ServerName calculadora.tudominio.com
    DocumentRoot /var/www/CalculadoraKavana

    <Directory /var/www/CalculadoraKavana>
        AllowOverride All
        Require all granted
        
        # Habilitar mod_rewrite
        RewriteEngine On
        
        # Redirigir todo a index.html (SPA)
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [L]
    </Directory>

    # Compresión
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript
    </IfModule>

    # Cache
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
    </IfModule>

    # Headers de seguridad
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</VirtualHost>
```

### 5.2 Activar Sitio

```bash
sudo a2ensite calculadora.conf
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl reload apache2
```

---

## 6. Despliegue en AWS S3

### 6.1 Crear Bucket

```bash
# Crear bucket
aws s3 mb s3://calculadora-tudominio --region us-east-1

# Habilitar hosting web
aws s3 website s3://calculadora-tudominio \
    --index-document index.html \
    --error-document index.html
```

### 6.2 Política del Bucket

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::calculadora-tudominio/*"
        }
    ]
}
```

### 6.3 Subir Archivos

```bash
# Sincronizar archivos
aws s3 sync . s3://calculadora-tudominio \
    --exclude ".git/*" \
    --exclude "docs/*" \
    --exclude "tests/*" \
    --exclude "plans/*"
```

### 6.4 CloudFront (CDN)

```bash
# Crear distribución CloudFront
aws cloudfront create-distribution \
    --origin-domain-name calculadora-tudominio.s3.amazonaws.com \
    --default-root-object index.html
```

---

## 7. Despliegue con Docker (Opcional)

### 7.1 Dockerfile

```dockerfile
FROM nginx:alpine

# Copiar archivos de la app
COPY . /usr/share/nginx/html/

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### 7.2 nginx.conf para Docker

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 7.3 Build y Run

```bash
# Build
docker build -t calculadora-kavana .

# Run
docker run -d -p 8080:80 calculadora-kavana

# Verificar
curl http://localhost:8080
```

---

## 8. Configuración Post-Despliegue

### 8.1 Verificación de PWA

1. Abrir la app en Chrome
2. Abrir DevTools > Application
3. Verificar:
   - [ ] Service Worker registrado y activo
   - [ ] Manifest cargado correctamente
   - [ ] Íconos instalados
   - [ ] Cache almacenado

### 8.2 Testing de Offline

1. Abrir la app
2. Ir a DevTools > Network
3. Marcar **Offline**
4. Recargar la página
5. Verificar que funciona correctamente

### 8.3 Auditoría Lighthouse

```bash
# Instalar Lighthouse
npm i -g lighthouse

# Ejecutar auditoría
lighthouse https://tudominio.com --output html --view
```

**Scores esperados:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >80
- PWA: >90

---

## 9. Monitoreo

### 9.1 Métricas Clave

| Métrica | Umbral | Herramienta |
|---------|--------|-------------|
| Uptime | >99.9% | UptimeRobot, Pingdom |
| Tiempo de Carga | <2s | Lighthouse, WebPageTest |
| Errores JS | 0 | Sentry (opcional) |
| Uso de Storage | <80% | Console del navegador |

### 9.2 Logs de Service Worker

```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW Registrations:', registrations);
});

// Verificar caché
caches.keys().then(names => {
    console.log('Cache names:', names);
});
```

---

## 10. Troubleshooting

### 10.1 Problemas Comunes

| Problema | Causa Solución |
|----------|----------------|
| app no carga en `file://` | ES Modules requieren HTTP. Usar `npx serve .` |
| Service Worker no registra | Verificar HTTPS (excepto localhost) |
| Datos no persisten | localStorage bloqueado. Verificar privacidad |
| Cache obsoleta | Incrementar versión en `sw.js` y `?v=` params |
| CORS errors | Servidor debe servir desde HTTP, no file:// |

### 10.2 Reset Completo

```javascript
// Ejecutar en consola del navegador
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
});
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});
localStorage.clear();
location.reload();
```

---

## 11. Backup y Recuperación

### 11.1 Backup Manual

1. Abrir la app
2. Ir a pestaña **Historial**
3. Click **📤 Exportar Backup (JSON)**
4. Guardar el archivo `prodcalc_backup_YYYY-MM-DD.json`

### 11.2 Restaurar Backup

1. Abrir la app
2. Ir a pestaña **Historial**
3. Click **📥 Importar Backup**
4. Seleccionar archivo JSON

### 11.3 Backup Automático (Script)

```bash
#!/bin/bash
# backup-calculadora.sh
# Exportar localStorage via Puppeteer

node -e "
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://tudominio.com');
    
    const data = await page.evaluate(() => {
        return {
            templates: JSON.parse(localStorage.getItem('prodcalc_templates') || '[]'),
            sessions: JSON.parse(localStorage.getItem('prodcalc_sessions') || '[]')
        };
    });
    
    const fs = require('fs');
    fs.writeFileSync('backup_' + new Date().toISOString().slice(0,10) + '.json', 
        JSON.stringify(data, null, 2));
    
    await browser.close();
})();
"
```

---

*Documento mantenido por el equipo de Infraestructura y Sistemas.*
