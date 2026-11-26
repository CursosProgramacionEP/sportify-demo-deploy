# Frontend de Sportify

Interfaz React con Vite. La instalación completa, versiones y configuración se encuentran en el [README raíz](../README.md).

Desde esta carpeta:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev -- --port 5173 --strictPort
```

`VITE_API_URL` define el servidor REST; el valor de ejemplo es `http://localhost:8080/api`. Usar `npm run build` para compilar y `npm run lint` para revisar el código.

- [Manual de usuario](../docs/MANUAL_USUARIO.md).
- [Contrato del cliente HTTP](../docs/API_FRONTEND.md).
- [Limitaciones de esta versión](../docs/DOCUMENTACION_TECNICA.md#limitaciones-verificadas).
