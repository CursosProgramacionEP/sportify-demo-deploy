import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

let server;
let Button, FormField, StatusMessage, ThemeProvider;
let FechaAsignacion;
let listarComplejos, registrarComplejo, listarUsuarios;
let listarAdministradoresComplejo, asociarAdministradorComplejo, quitarAdministradorComplejo;
const pages = {};
const render = (component, props, ...children) => renderToStaticMarkup(h(component, props, ...children));
const renderWithProviders = (component, props = {}, ...children) =>
  render(ThemeProvider, {}, h(MemoryRouter, {}, h(component, props, ...children)));

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
    logLevel: "silent",
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
  });
  const load = async (path) => (await server.ssrLoadModule(`/src/${path}.jsx`)).default;
  Button = await load("components/ui/Button");
  FormField = await load("components/ui/FormField");
  StatusMessage = await load("components/ui/StatusMessage");
  ThemeProvider = await load("contexts/ThemeContext");
  FechaAsignacion = await load("components/features/FechaAsignacion");
  ({
    listarComplejos,
    registrarComplejo,
    listarUsuarios,
    listarAdministradoresComplejo,
    asociarAdministradorComplejo,
    quitarAdministradorComplejo,
  } = await server.ssrLoadModule("/src/services/api.js"));
  for (const name of ["Login", "Registro", "RecuperarContra", "IngresaContraNueva"]) {
    pages[name] = await load(`pages/${name}`); 
  }
});

after(async () => { await server?.close(); });

test("la fecha de asignación conserva el día de Perú y no inventa fechas históricas", () => {
  const html = render(FechaAsignacion, { fecha: "2026-10-06" });
  assert.match(html, /dateTime="2026-10-06"/);
  assert.match(html, /06\/10\/2026/);
  for (const fecha of [null, undefined, "", "incorrecta", "2026-02-30"]) {
    assert.match(render(FechaAsignacion, { fecha }), /Sin fecha registrada/);
  }
});

test("el catálogo consulta el endpoint y conserva los IDs y estados de PostgreSQL", async (t) => {
  const datos = [{ idComplejo: 7, nombre: "Cancha Central", direccion: "Av. Lima", telefono: null, estado: "ACTIVO" }];
  const signal = new AbortController().signal;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json(datos));
  assert.deepEqual(await listarComplejos(signal), datos);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.ok(url.endsWith("/api/complejos"));
  assert.equal(options.signal, signal);
  assert.equal(options.headers.Accept, "application/json");
});

test("el alta de complejos persiste en POST y devuelve el ID asignado", async (t) => {
  const creado = { idComplejo: 14, nombre: "Cancha Norte", direccion: "Av. Norte", telefono: "987654321", estado: "ACTIVO" };
  const fetchMock = t.mock.method(globalThis, "fetch", async (url) => Response.json(
    url.endsWith("/auth/csrf") ? { token: "csrf-prueba", headerName: "X-CSRF-TOKEN" } : creado,
  ));
  assert.deepEqual(await registrarComplejo({ ...creado, idComplejo: undefined, estado: "Activo" }), creado);
  const [url, options] = fetchMock.mock.calls[1].arguments;
  assert.ok(url.endsWith("/api/complejos"));
  assert.equal(options.method, "POST");
  assert.equal(options.credentials, "include");
  assert.equal(options.headers["X-CSRF-TOKEN"], "csrf-prueba");
  assert.equal(JSON.parse(options.body).estado, "ACTIVO");
});

test("usuarios para administración vienen de la API y no incluyen credenciales", async (t) => {
  const usuarios = [{ idUsuario: 4, nombres: "Nora", apellidos: "Ríos", telefono: null, correo: "nora@example.com" }];
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json(usuarios));
  assert.deepEqual(await listarUsuarios(), usuarios);
  assert.ok(fetchMock.mock.calls[0].arguments[0].endsWith("/api/usuarios"));
  assert.equal(fetchMock.mock.calls[0].arguments[1].headers.Accept, "application/json");
});

test("administradores consulta, asocia y quita relaciones persistidas", async (t) => {
  const asociacion = { idUsuario: 4, idComplejo: 8 };
  const fetchMock = t.mock.method(globalThis, "fetch", async (_url, options = {}) => {
    if (_url.endsWith("/auth/csrf")) return Response.json({ token: "csrf-prueba", headerName: "X-CSRF-TOKEN" });
    if (options.method === "POST") return Response.json(asociacion);
    if (options.method === "DELETE") return new Response(null, { status: 204 });
    return Response.json([asociacion]);
  });

  assert.deepEqual(await listarAdministradoresComplejo(8), [asociacion]);
  assert.deepEqual(await asociarAdministradorComplejo(8, 4), asociacion);
  await quitarAdministradorComplejo(8, 4);

  const calls = fetchMock.mock.calls.filter(call => !call.arguments[0].endsWith("/auth/csrf"));
  assert.equal(calls[1].arguments[1].method, "POST");
  assert.deepEqual(JSON.parse(calls[1].arguments[1].body), { idUsuario: 4 });
  assert.equal(calls[2].arguments[1].method, "DELETE");
  assert.ok(calls[2].arguments[0].endsWith("/api/complejos/8/administradores/4"));
});

test("una lista vacía es válida; errores HTTP y formatos inesperados no simulan un catálogo vacío", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json([]));
  assert.deepEqual(await listarComplejos(), []);
  fetchMock.mock.mockImplementation(async () => new Response("Error interno", { status: 500 }));
  await assert.rejects(listarComplejos(), /HTTP 500/);
  fetchMock.mock.mockImplementation(async () => new Response("<html>Error</html>"));
  await assert.rejects(listarComplejos(), /respuesta inválida/);
  for (const datos of [{}, [null], [{ idComplejo: 1, nombre: "A", direccion: "B", estado: "Activo" }]]) {
    fetchMock.mock.mockImplementation(async () => Response.json(datos));
    await assert.rejects(listarComplejos(), /listado de complejos inválido/);
  }
});

test("distingue un fallo de red de una solicitud cancelada al salir", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(listarComplejos(), /No se pudo conectar/);
  const controller = new AbortController();
  controller.abort();
  fetchMock.mock.mockImplementation(async () => { throw controller.signal.reason; });
  await assert.rejects(listarComplejos(controller.signal), { name: "AbortError" });
});

test("los botones no envían formularios accidentalmente y se bloquean durante la carga", () => {
  assert.match(render(Button, {}, "Cancelar"), /type="button"/);
  const loading = render(Button, { type: "submit", loading: true, loadingLabel: "Guardando..." }, "Guardar");
  assert.match(loading, /type="submit"/);
  assert.match(loading, /disabled=""/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /Guardando\.\.\./);
  assert.doesNotMatch(loading, />Guardar</);
  assert.match(render(Button, { disabled: true, variant: "secondary" }, "Cancelar"), /disabled=""/);
});

test("los campos generan identificadores independientes y conservan restricciones nativas", () => {
  const html = render(Fragment, {},
    h(FormField, { label: "Teléfono", name: "telefono", type: "tel", pattern: "[0-9]{9}", required: true }),
    h(FormField, { label: "Correo", name: "correo", type: "email", autoComplete: "email" }),
  );
  const ids = [...html.matchAll(/<input[^>]*\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.notEqual(ids[0], ids[1]);
  for (const id of ids) assert.ok(html.includes(`for="${id}"`));
  assert.match(html, /pattern="\[0-9\]\{9\}"/);
  assert.match(html, /required=""/);
  assert.match(html, /autoComplete="email"/);
});

test("el error de campo se vincula al input sin perder descripciones adicionales", () => {
  const html = render(FormField, {
    id: "correo", label: "Correo", error: "Correo inválido", "aria-describedby": "ayuda-correo",
  });
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="ayuda-correo correo-error"/);
  assert.match(html, /id="correo-error"/);
  assert.match(html, /role="alert"/);
});

test("los mensajes vacíos no aparecen y los resultados usan la prioridad adecuada", () => {
  assert.equal(render(StatusMessage, { message: "" }), "");
  assert.match(render(StatusMessage, { message: "Error de conexión" }), /role="alert"/);
  assert.match(render(StatusMessage, { type: "exito", message: "Guardado" }), /role="status"/);
});

test("las cuatro pantallas conservan campos, envío y estructura de autenticación", () => {
  const expected = {
    Login: ["correo", "contrasena", "recordar"],
    Registro: ["nombres", "apellidos", "telefono", "correo", "contrasena", "confirmarContrasena"],
    RecuperarContra: ["correo"],
    IngresaContraNueva: ["contrasena", "confirmarContrasena"],
  };
  for (const [name, fields] of Object.entries(expected)) {
    const html = renderWithProviders(pages[name]);
    assert.match(html, /class="pagina-login/);
    assert.match(html, /class="marca-login"/);
    assert.match(html, /type="submit"/);
    const actual = [...html.matchAll(/<input[^>]*\sname="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(actual, fields, name);
    assert.equal((html.match(/<form\b/g) || []).length, 1, name);
    if (name === "Registro") {
      assert.match(html, /minLength="8"/);
      assert.match(html, /pattern="\[0-9\]\{9\}"/);
    }
  }
});
