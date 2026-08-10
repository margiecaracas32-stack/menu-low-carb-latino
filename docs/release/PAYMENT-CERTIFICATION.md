# Certificación de pagos — Hotmart

Fecha: 2026-08-10. Producto Hotmart: `8281371`.

| Caso | Resultado | Evidencia / pendiente |
|---|---|---|
| Trial mensual día 0 → acceso | Aprobado | Transacción `HP2140367396`; evento reprocesado 200; cuenta, correo, sesión y `/app` comprobados |
| Cancelación durante trial | Aprobado | Sin renovación; acceso hasta 2026-08-17; `cancel_at_period_end=true` |
| Reenvío del mismo evento | Aprobado | Dos pruebas 200; dedupe por evento y ledger económico |
| Producto, plan, importe o moneda ajenos | Aprobado | Tests automáticos rechazan catálogo ajeno; 10/10 pruebas |
| Fallo de correo | Aprobado por contrato | Webhook marca `failed` y responde 500 para reintento; entrega real por Resend verificada |
| Trial anual día 0 → acceso | No verificado | Requiere una adhesión anual controlada con tarjeta |
| Primer cobro mensual/anual | No verificado | La prueba se canceló antes del cobro; realizarlo cuesta dinero |
| Pago rechazado → gracia → recuperación | No verificado | Falta evento real/sandbox representativo |
| APPROVED + COMPLETE → un ingreso | Verificado por test y constraints | Ledger único por transacción + tipo económico; falta par real de Hotmart |
| Reembolso | No verificado E2E | Parser y estado existen; falta transacción real reembolsada |
| Contracargo | No verificado E2E | Parser y estado existen; falta evento real |
| Compra con correo distinto | No verificado | Falta caso controlado de reconciliación |

## Veredicto

El recorrido mensual de prueba y cancelación está certificado. No abrir tráfico público hasta probar o limitar explícitamente los casos restantes. Toda prueba que genere un cobro requiere aprobación previa de la propietaria.
