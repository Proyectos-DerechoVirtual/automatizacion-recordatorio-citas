# Automatización Recordatorio de Citas

Sistema automatizado que gestiona el ciclo de vida completo de citas agendadas en Calendly: envía recordatorios por WhatsApp, clasifica las respuestas de los clientes con IA y ejecuta acciones según la intención detectada (confirmar, cancelar, reprogramar, etc.).

Desplegado como funciones serverless en **Vercel**, disparado cada 2 minutos por un cron externo en **cron-job.org**.

## Qué hace exactamente

El sistema ejecuta **3 flujos** en cada ciclo (cada 2 minutos):

### Flujo 1 — Recordatorios y auto-cancelación (`reminderFlow`)

1. Obtiene los eventos programados de **3 usuarios de Calendly** (con sus invitados).
2. Cruza esos eventos con los datos existentes en **Supabase** (tabla `citas`).
3. Filtra las citas que están a menos de 5 horas de comenzar.
4. Hace **upsert** de cada cita en Supabase (crea o actualiza).
5. Envía **recordatorios por WhatsApp** (vía UltraMsg) según el tiempo restante:
   - **5 horas antes** — primer contacto con enlace de Zoom y solicitud de confirmación (solo citas de 11:00 en adelante).
   - **3 horas antes** — segundo recordatorio pidiendo confirmación (para citas tempranas, este es el primer contacto).
   - **1 hora antes** — último aviso, advirtiendo que se cancelará en 45 min sin confirmación.
   - Cada recordatorio tiene **plantillas personalizadas** según el tipo de producto/evento (Formación Justicia Express, Oposiciones, Videoleyes, Derecho Virtual, IIPP, etc.).
   - No se reenvía un recordatorio si ya fue enviado previamente.
   - No se envía recordatorio de 3h/1h si el cliente ya respondió (excepto si la respuesta fue "discutido").
6. **Auto-cancela** citas que cumplen todas estas condiciones:
   - Faltan menos de ~11 minutos para la cita.
   - El cliente **no ha respondido** al recordatorio.
   - El evento sigue activo en Calendly.
   - Al auto-cancelar: cancela en Calendly, notifica al admin por WhatsApp, notifica al cliente, y actualiza Supabase.

### Flujo 2 — Clasificación de respuestas con IA (`classificationFlow`)

1. Consulta en Supabase las citas cercanas (0-5h) que tienen recordatorio enviado pero **sin respuesta procesada** (o con respuesta "discutido").
2. Para cada cita, obtiene los **últimos mensajes del chat de WhatsApp** vía UltraMsg.
3. Verifica si el agente ya respondió al último mensaje del cliente. Si ya respondió, no procesa.
4. Envía la conversación a **Google Gemini** (modelo `gemini-2.0-flash-exp`) con un prompt que incluye:
   - Datos de la cita (nombre, hora, producto, enlaces).
   - Los mensajes recientes del chat.
   - Ejemplos de clasificación sacados de una base de datos de entrenamiento (equivalente al Google Sheets del workflow original).
5. Gemini clasifica la respuesta en una de 5 categorías y genera una respuesta como agente humano:
   - **confirmado** — El cliente confirma asistencia → notifica al admin, envía confirmación al cliente, actualiza Supabase.
   - **cancelado** — El cliente no puede/quiere asistir → cancela en Calendly, notifica admin, envía link de reagendamiento al cliente, actualiza Supabase.
   - **reprogramado** — El cliente quiere cambiar fecha/hora → cancela en Calendly, envía link de reagendamiento, notifica admin, actualiza Supabase.
   - **cuestionamiento** — El cliente tiene dudas, preguntas o no está seguro → envía respuesta del agente IA al cliente, notifica al admin para que intervenga, actualiza Supabase.
   - **discutido** — Respuesta no clara o conversación que no encaja → envía respuesta del agente IA, actualiza Supabase.

### Flujo 3 — Notificación de nuevas citas (`newAppointmentFlow`)

1. Obtiene **todos los eventos** del usuario principal de Calendly (hasta 100).
2. Los cruza con Supabase para detectar cuáles son **nuevos** (no tienen `aviso_cita_programada: "enviado"`).
3. Para cada cita nueva (no cancelada):
   - Envía una **notificación al grupo de admin** con los datos del cliente (nombre, WhatsApp, hora, fecha, email, producto).
   - Hace **upsert** en Supabase marcando `aviso_cita_programada: "enviado"` para no re-notificar.

## Stack

| Servicio | Uso |
|---|---|
| **Vercel** | Hosting serverless (funciones en `/api`) |
| **cron-job.org** | Cron externo cada 2 min que llama a `/api/cron` |
| **Calendly API** | Obtener eventos, invitados, cancelar citas |
| **Supabase** (self-hosted) | Base de datos PostgreSQL — tabla `citas` |
| **UltraMsg** | Enviar/recibir mensajes de WhatsApp |
| **Google Gemini** | Clasificación de respuestas con IA |

## Estructura del proyecto

```
├── api/
│   ├── cron.js              # Endpoint principal (ejecuta los 3 flujos)
│   └── health.js            # Health check
├── src/
│   ├── index.js             # Script local para testing manual
│   ├── config.js            # Configuración desde variables de entorno
│   ├── services/
│   │   ├── calendly.js      # API Calendly
│   │   ├── supabase.js      # API Supabase (REST)
│   │   ├── ultramsg.js      # API UltraMsg (WhatsApp)
│   │   └── gemini.js        # API Google Gemini (clasificación IA)
│   ├── flows/
│   │   ├── reminderFlow.js       # Flujo 1: recordatorios + auto-cancelación
│   │   ├── classificationFlow.js # Flujo 2: clasificación IA de respuestas
│   │   └── newAppointmentFlow.js # Flujo 3: notificación nuevas citas
│   └── utils/
│       ├── templates.js     # Plantillas de mensajes + ejemplos de clasificación
│       ├── whatsapp.js      # Normalización de números WhatsApp
│       └── helpers.js       # Utilidades de fecha/hora
├── vercel.json              # Config Vercel (maxDuration: 60s)
├── .env.example             # Template de variables de entorno
└── .gitignore
```

## Endpoints

| Endpoint | Método | Protección | Descripción |
|---|---|---|---|
| `/api/cron` | GET | Header `x-cron-secret` o query `?secret=` | Ejecuta los 3 flujos |
| `/api/health` | GET | Ninguna | Health check |

## Variables de entorno

Ver `.env.example` para la lista completa. Todas las credenciales se manejan exclusivamente vía variables de entorno.

## Cron externo

Configurado en [cron-job.org](https://cron-job.org):

- **URL:** `https://automatizacion-recordatorio-citas.vercel.app/api/cron`
- **Frecuencia:** cada 2 minutos (`*/2 * * * *`)
- **Header:** `x-cron-secret: <valor de CRON_SECRET>`

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar manualmente (requiere .env configurado)
npm start
```
