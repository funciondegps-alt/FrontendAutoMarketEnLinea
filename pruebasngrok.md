# Chicaeme SAS: backend local con ngrok (guía de pruebas)

Esta guía documenta lo que fue necesario cambiar para probar el sistema con el **backend corriendo en un PC local, expuesto a internet con ngrok**, y el **frontend** apuntando a ese túnel. También explica por qué se hizo cada cambio y qué cambia si en vez de un PC se usa un servidor en línea.

> **Seguridad:** nunca pegues en chats, issues ni commits el authtoken de ngrok, `JWT_SECRET`, contraseñas de correo ni credenciales de base de datos. Si alguno se expone, regéneralo.

---

## 1. Arquitectura de la prueba

```
Navegador (front React, localhost:5173 o hosting estático)
        │  HTTPS
        ▼
https://<tu-dominio>.ngrok-free.dev   ← túnel de ngrok
        │
        ▼
PC local: Spring Boot (puerto 8080) + MySQL
```

El front llama a la URL pública de ngrok; ngrok reenvía las peticiones al backend que corre en el PC.

---

## 2. Configuración de ngrok (una sola vez)

1. Crear cuenta en ngrok.com e instalar el cliente.
2. Registrar el authtoken (se copia desde el panel de ngrok):
   ```
   ngrok config add-authtoken <TU_TOKEN>
   ```
3. En el panel, sección **Domains**, reclamar el **dominio estático gratuito**. *Por qué:* sin él la URL cambia en cada reinicio y habría que reconfigurar y volver a desplegar el front cada vez.

### Uso diario (orden de arranque)

1. Base de datos encendida.
2. Backend corriendo; verificar `http://localhost:8080/api/articulos`.
3. Túnel:
   ```
   ngrok http --url=<tu-dominio>.ngrok-free.dev 8080
   ```
4. Abrir el front.

Panel local de ngrok: `http://127.0.0.1:4040` (muestra en vivo cada petición que entra por el túnel; útil para depurar y para comprobar que el front usa ngrok y no `localhost`).

> **Error `ERR_NGROK_334` ("endpoint already online"):** ya hay un túnel abierto con ese dominio (otra terminal, el terminal del IDE o un servicio). Ciérralo con `Ctrl + C` o `taskkill /F /IM ngrok.exe` y vuelve a abrirlo. No se pueden abrir dos túneles con el mismo dominio.

---

## 3. Cambios en el frontend

### 3.1 Archivo `.env` (raíz del front, junto a `package.json`)

```
VITE_API_URL=https://<tu-dominio>.ngrok-free.dev
```

**Por qué:** `config.js` lee `VITE_API_URL` para construir `API_BASE_URL`; así todo el front apunta al backend sin tocar código. Sin barra final ni comillas.

**Importante:**
- Vite solo lee `.env` al arrancar: reiniciar `npm run dev` tras cambiarlo.
- En despliegue, Vite **incrusta** la variable al compilar (build); si cambia, hay que volver a compilar y desplegar.
- `.env` no debe subirse a git (verificar con `git status`). `.env.example` sí es la plantilla que se versiona.

### 3.2 `src/services/authService.js`: header de ngrok

Se agregó:

```javascript
export const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };
```

y se usó en:

- Los 4 `fetch` públicos: `loginUsuario`, `loginConGoogle`, `solicitarRecuperacion`, `restablecerPassword` (`headers: { 'Content-Type': 'application/json', ...NGROK_HEADER }`).
- `authHeader()`, que ahora **siempre** devuelve el header de ngrok y, solo si hay sesión, también el token:

```javascript
export const authHeader = () => {
    const token = getToken();
    return {
        ...NGROK_HEADER,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};
```

**Por qué fue necesario:** en el plan gratuito, ngrok muestra una **página de advertencia HTML** a las peticiones que parecen venir de un navegador. Un `fetch` de React cuenta como navegador, así que recibía esa página en lugar del JSON. Como esa respuesta la genera ngrok y no tu backend, **no lleva headers CORS**, y Chrome la reporta como:

> `blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`

Parece un problema de CORS, pero el backend estaba bien. Enviar el header `ngrok-skip-browser-warning` (con cualquier valor) le dice a ngrok que se salte la advertencia.

**Por qué en `authHeader()`:** `authFetch` (en `http.js`) ya llama a `authHeader()`, así que todas las peticiones protegidas (artículos, cotizaciones, etc.) heredan el header sin tocar cada service. `http.js` no necesitó cambios.

> Cualquier `fetch(` directo en otros archivos que no pase por `authFetch` necesita `...NGROK_HEADER` (se exporta justamente para eso: `import { NGROK_HEADER } from './authService'`).

### 3.3 `index.html`: evitar el traductor del navegador (recomendado)

```html
<html lang="es" translate="no">
...
<meta name="google" content="notranslate" />
```

**Por qué:** cuando Chrome traduce una página, envuelve los textos en etiquetas `<font>`. React luego intenta modificar nodos que ya no existen y la app se queda en blanco con el error:

> `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node`

Esto le puede pasar también a los clientes reales, así que conviene dejarlo.

---

## 4. Backend

### 4.1 Código: no fue necesario cambiar el CORS

Se comprobó con `curl` que tanto `localhost:8080` como el dominio de ngrok responden al preflight (`OPTIONS`) con `Access-Control-Allow-Origin: http://localhost:5173` y aceptan el header `ngrok-skip-browser-warning`. La configuración existente ya era correcta:

- `SecurityConfig`: `setAllowedOrigins`, `setAllowedHeaders(List.of("*"))` y `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`.
- `CorsConfig`: solo es necesario para servir `/uploads/**`.

### 4.2 Variables de entorno

| Variable | Valor en esta prueba | Para qué sirve |
|---|---|---|
| `BACKEND_URL` | `https://<tu-dominio>.ngrok-free.dev` | Las imágenes subidas se guardan con URL absoluta basada en esta variable |
| `FRONTEND_URL` | URL donde corre el front | Origen permitido en CORS y base del enlace del correo de recuperar contraseña |

Reiniciar el backend después de cambiarlas.

**Imágenes antiguas:** las fotos subidas antes de configurar `BACKEND_URL` quedaron guardadas con `http://localhost:8080/uploads/...`. Solo se ven en el PC local; para que carguen desde otros dispositivos hay que volver a subirlas.

---

## 5. Cómo comprobar que realmente se usa ngrok y no `localhost`

1. **Panel de ngrok** (`http://127.0.0.1:4040`): si al usar la app aparecen las peticiones, el front usa el túnel.
2. **DevTools → Network → Fetch/XHR:** la *Request URL* debe empezar por el dominio de ngrok.
3. **Prueba definitiva:** detener ngrok (`Ctrl + C`) y recargar. Si el catálogo deja de cargar, estaba usando el túnel.

---

## 6. Problemas encontrados y su causa

| Síntoma | Causa | Solución |
|---|---|---|
| `ERR_NGROK_334` al abrir el túnel | Ya había un túnel con ese dominio | Cerrar el anterior |
| Error de CORS solo en el front (el JSON se ve bien en el navegador) | ngrok devuelve su página de advertencia sin headers CORS | Header `ngrok-skip-browser-warning` |
| 403 en rutas de cotizaciones y usuario | Token ausente, vencido o de una sesión anterior | Cerrar sesión y volver a entrar |
| Pantalla en blanco con `removeChild` en la consola | Traductor de Chrome | `translate="no"` y meta `notranslate` |
| Advertencia `Cross-Origin-Opener-Policy ... postMessage` | Botón de Google Sign-In | Es inofensiva |

---

## 7. Si en lugar de un PC fuera un servidor en línea

Casi todo lo anterior existe por ngrok gratis, no por usar un PC.

**Desaparece:**
- ngrok y su dominio.
- El header `ngrok-skip-browser-warning` (dejarlo no rompe nada, pero sobra).
- La dependencia de que el PC, la base de datos y el túnel estén encendidos.

**Se mantiene igual:**
- `VITE_API_URL` apuntando al backend (incrustada al compilar).
- El dominio del front dentro de los orígenes permitidos de CORS.
- `FRONTEND_URL` y `BACKEND_URL` con los dominios reales.
- Los orígenes autorizados de Google en Google Cloud Console.
- El flujo JWT.

**Se agrega:**
- **Base de datos administrada** (probablemente PostgreSQL: driver en el `pom.xml` y `DB_URL` con `jdbc:postgresql://...`). Lo ideal es que desarrollo y producción usen el mismo motor.
- **Almacenamiento persistente de imágenes** (Cloudinary, S3 o disco persistente). En plataformas como Render o Railway el filesystem es efímero y las fotos se pierden en cada reinicio.
- **Secretos en variables del hosting:** `JWT_SECRET`, `DB_*`, `MAIL_*`, `GOOGLE_CLIENT_ID`.
- **HTTPS en front y back.** Un front en `https` no puede llamar a un backend en `http` (contenido mixto).
- A mediano plazo, migraciones con Flyway en vez de `ddl-auto=update`.

---

## 8. Pendientes y mejoras sugeridas

- **Orígenes de CORS para el front en línea:** al desplegar, agregar su dominio en `SecurityConfig`, por ejemplo `List.of("http://localhost:5173", "https://tu-front.vercel.app")`, y actualizar `FRONTEND_URL`.
- **Google Sign-In:** agregar el dominio del front a los orígenes autorizados.
- **Campo `password` en las respuestas:** revisar si el JSON de `/api/cotizaciones` incluye el hash de la contraseña dentro de `usuario`. Si aparece, marcarlo con `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` en el modelo `Usuario` (o devolver un DTO).
- **Limpieza:** eliminar la carpeta sobrante `auto-market-frontend` del repositorio del front.
- **Seguridad en pruebas:** con ngrok el backend es accesible para cualquiera que tenga la URL; no usar datos reales de clientes en la base de pruebas.