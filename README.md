# Sportify

Sportify es un proyecto académico para administrar complejos deportivos y facilitar a los usuarios la consulta de canchas y la organización de equipos y partidos. El repositorio contiene una aplicación web React y una API REST con Spring Boot y PostgreSQL. El proyecto sigue en desarrollo: algunas pantallas están conectadas a datos reales y otras muestran información de demostración o tienen operaciones pendientes. El [manual de usuario](docs/MANUAL_USUARIO.md) describe los flujos disponibles.

## Funciones disponibles

- Registro e inicio de sesión con sesión HTTP y permisos por rol.
- Administración de usuarios, complejos y asignaciones de administradores de complejo para `ADMIN_PLATAFORMA`.
- Configuración de complejo y horarios, y reportes para `ADMIN_COMPLEJO`; el alcance concreto depende de los datos existentes.
- Gestión de equipos, integrantes y partidos, además de consulta del catálogo de canchas para `CLIENTE`.
- El panel **Inicio** consulta métricas y actividad reciente al backend. Sus leyendas visuales de actualización en tiempo real e inmutabilidad no garantizan esas propiedades. Recuperación y cambio de contraseña no completan un restablecimiento real. La consulta de canchas no crea reservas ni verifica reservas existentes.

## Tecnologías y requisitos

| Componente | Versión o requisito | Fuente |
| --- | --- | --- |
| Java | JDK 21; el proyecto compila con objetivo Java 21 | `backend/sportify-backend/pom.xml` |
| Maven | Wrapper del repositorio; descarga Maven 3.9.16 | `backend/sportify-backend/.mvn/wrapper/maven-wrapper.properties` |
| Node.js | 20.19+, 22.13+ o 24+ según los requisitos de las dependencias bloqueadas | `frontend/package-lock.json` |
| npm | Incluido con Node.js; `npm ci` utiliza el lockfile | `frontend/package-lock.json` |
| PostgreSQL | Servidor accesible y base compatible; no se fija versión en el proyecto | `application.properties` |
| Navegador | Navegador moderno con JavaScript habilitado | Aplicación web |

También se requiere Git para clonar el repositorio y conexión de red la primera vez que Maven Wrapper y npm descarguen herramientas o dependencias. Las versiones de React, React Router, Vite y otras dependencias están declaradas en `frontend/package.json` y resueltas en `frontend/package-lock.json`.

## Estructura

```text
backend/sportify-backend/  API Spring Boot, entidades, servicios, pruebas y SQL parcial
frontend/                  Aplicación React/Vite y pruebas del cliente
docs/                      Manuales y documentación técnica
scripts/                   Herramientas de documentación
```

## Preparación inicial de una computadora

Estos pasos corresponden a quien administra el equipo. Una persona que solo use una instalación ya preparada debe seguir “Ejecución habitual” y el [manual de usuario](docs/MANUAL_USUARIO.md).

1. Instalar Git, JDK 21, Node.js/npm y PostgreSQL, o solicitar al responsable las direcciones de los servicios ya instalados.
2. Clonar o copiar el repositorio. En PowerShell:

   ```powershell
   git clone <URL-del-repositorio>
   cd <carpeta-del-repositorio>
   ```

3. Crear la base `sportify_bd` (o acordar otro nombre y configurar su URL) y obtener del equipo responsable el esquema inicial oficial y su procedimiento de aplicación. **Este repositorio no contiene un DDL inicial completo**: los archivos `backend/sportify-backend/sql/001`–`005` son complementos que presuponen tablas o datos existentes. No se puede garantizar una instalación funcional desde una base vacía usando solo esos archivos. Hibernate tiene `spring.jpa.hibernate.ddl-auto=update`, que intenta actualizar el esquema al arrancar, pero no sustituye un esquema inicial ni migraciones reproducibles.
4. El backend lee `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`. La URL predeterminada es `jdbc:postgresql://localhost:5432/sportify_bd`; usuario y contraseña deben configurarse localmente. Para usar la plantilla del perfil local, desde `backend/sportify-backend`:

   ```powershell
   Copy-Item src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   ```

   Editar la copia local con los datos de PostgreSQL; no publicar ni compartir ese archivo. Alternativamente, definir las tres variables en el entorno del proceso. Spring Boot no carga automáticamente archivos `.env`.
5. El frontend toma la URL de API de `frontend/.env.local`. Desde `frontend`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   La plantilla apunta a `http://localhost:8080/api`. El backend permite el origen de desarrollo `http://localhost:5173`.
6. Para las cuentas y roles administrativos, solicitar al responsable del proyecto el procedimiento aprobado de provisión. El código de inicialización incluye una cuenta administrativa codificada; sus credenciales no se reproducen aquí y esto requiere revisión antes de desplegar el sistema en un laboratorio.

Los scripts SQL deben revisarse y aplicarse únicamente con el orden y la base confirmados por el responsable. Algunos requieren tablas y registros previos, así que no se presenta una secuencia especulativa.

## Ejecución habitual

Requiere que PostgreSQL esté iniciado, que la base y el esquema hayan sido preparados y que las propiedades locales estén configuradas.

1. En una terminal PowerShell, iniciar el backend:

   ```powershell
   cd backend/sportify-backend
   .\mvnw.cmd spring-boot:run
   ```

   El perfil `local` ya está activado en `application.properties`. La API usa el puerto 8080 por defecto. Mantener esta terminal abierta.
2. En otra terminal, instalar las dependencias del frontend la primera vez y arrancar Vite:

   ```powershell
   cd frontend
   npm.cmd ci
   npm.cmd run dev -- --port 5173 --strictPort
   ```

3. Abrir `http://localhost:5173`. La API está en `http://localhost:8080`; el prefijo de API usado por el frontend es `/api`.
4. Para detener cada servicio, volver a su terminal y pulsar `Ctrl+C`.

En Linux/macOS, usar `./mvnw` y `npm` con la sintaxis de la terminal correspondiente. La primera ejecución necesita red para descargar Maven y dependencias.

## Comprobaciones

Desde `frontend` se pueden ejecutar:

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Las pruebas del backend y el arranque requieren que las dependencias Maven estén disponibles; los tests de contexto también pueden depender de PostgreSQL. Desde `backend/sportify-backend`:

```powershell
.\mvnw.cmd test
```

Ver una página no demuestra que todas las funciones estén conectadas a datos persistidos. Consultar el manual para conocer las limitaciones funcionales.

## Documentación

- [Manual de usuario](docs/MANUAL_USUARIO.md)
- [Documentación técnica](docs/DOCUMENTACION_TECNICA.md)
- [API consumida por el frontend](docs/API_FRONTEND.md)
- [Documentación de iteración 3](docs/ITERACION_3_USUARIOS.md)
- [Índice de documentación](docs/README.md)
- [Javadoc generado](docs/javadoc/index.html), si está disponible en la copia del repositorio

## Problemas frecuentes

| Síntoma | Comprobación |
| --- | --- |
| El backend no conecta a PostgreSQL | Confirmar que PostgreSQL está activo, la URL/puerto/base son correctos y las variables `DB_USERNAME` y `DB_PASSWORD` están definidas. No compartir sus valores. |
| Error de tablas o columnas al arrancar | La base puede no tener el esquema inicial requerido. Los SQL versionados son parciales; pedir al responsable el esquema aprobado. |
| El frontend no llega a la API | Confirmar backend en puerto 8080, `VITE_API_URL` en `.env.local` y origen frontend en puerto 5173; reiniciar Vite tras cambiar la variable. |
| `npm ci` falla por versión de Node | Usar Node.js 20.19+, 22.13+ o 24+, según los engines de las dependencias bloqueadas. |
| Puerto ocupado | Detener el otro proceso que lo usa o coordinar otro puerto con el responsable; el CORS configurado permite el origen de desarrollo 5173. |
| No se puede iniciar sesión | Usar una cuenta válida provisionada por el equipo. El registro público crea cuentas de cliente, no cuentas administrativas. |

## Equipo y entregables

Autoría documental: **Equipo Sportify**.

| Integrante | Responsabilidad |
| --- | --- |
| Donayre Flores Franco Maximo | Desarrollo frontend |
| Quispe Huallpa Elizabet Guadalupe | Desarrollo frontend |
| Hilario Vera Jack Jeremy | Desarrollo backend |
| Arellan Blanco Leonardo Daniel | Desarrollo backend |
| Umpire Paulo | Desarrollo backend |

| Entregable | Enlace / dato |
| --- | --- |
| Prototipos en Figma | [Sportify: prototipos desarrollados hasta el momento](https://www.figma.com/design/uLjY0eqWlfBBQ230GUa95b/Sportify?node-id=0-1&t=Lieba2IlowRtDppg-1) |
| Análisis de Pantallas y Reportes | Pendiente: proporcionar URL del documento oficial |
