# Especificación de pantalla — Login y acceso

```yaml
pantalla: login_passwordless
objetivo: recuperar y guardar la semana con el correo de compra, sin contraseña
objeto_principal: correo de acceso y confirmación de envío
niveles: {display: 34px, title: 22px, body: 16px, label: 14px}
acento_en: CTA de envío y confirmación del correo
baseline_aplican: [stagger, tap, success]
dispositivo_ownable: semana editorial de siete días guardada dentro de un recetario
estados: [empty, loading, success, error, disabled, offline]
```

## Recorrido

1. Explicar por qué se pide el correo: guardar y recuperar la semana en cualquier dispositivo.
2. Solicitar únicamente el correo usado en la compra.
3. Enviar un enlace de un solo uso, sin contraseña.
4. Mostrar la misma confirmación exista o no la cuenta, evitando revelar usuarios registrados.
5. Bloquear reenvío durante 60 segundos y conservar el correo visible/editable.
6. Sin conexión: conservar el formulario y explicar cómo continuar.
7. Google aparece como alternativa secundaria simulada hasta conectar Supabase.

## Seguridad de esta etapa local

- No se crean contraseñas, sesiones, tokens ni códigos falsos.
- No se guarda el correo en `localStorage`.
- No existe bypass para entrar a `/app` sin una sesión real.
- La conexión posterior usará Supabase Auth, cookies HttpOnly y límites de envío en servidor.
