const API_URL = "https://www.swapi.tech/api/starships";
const PAGE_SIZE = 9;
const MAX_INDEX_PAGES = 12;
const DETAIL_BATCH_SIZE = 3;

const state = {
    catalogo: [],
    detalles: new Map(),
    pagina: 1,
    version: 0
};

export function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim();
}

export function filtrarYOrdenar(naves, busqueda = "", orden = "nombre") {
    const texto = normalizarTexto(busqueda);
    const filtradas = naves.filter((nave) => normalizarTexto(nave.name).includes(texto));

    return [...filtradas].sort((a, b) => {
        if (orden === "id") {
            return Number(a.uid) - Number(b.uid);
        }
        return a.name.localeCompare(b.name, "es");
    });
}

export function obtenerPagina(items, numero = 1, cantidad = PAGE_SIZE) {
    const totalPaginas = Math.max(1, Math.ceil(items.length / cantidad));
    const pagina = Math.max(1, Math.min(numero, totalPaginas));
    return {
        pagina,
        totalPaginas,
        items: items.slice((pagina - 1) * cantidad, pagina * cantidad)
    };
}

export function mostrarValor(valor) {
    const texto = String(valor ?? "").trim();
    if (!texto || ["unknown", "n/a", "none", "null", "undefined"].includes(texto.toLowerCase())) {
        return "No disponible";
    }
    return texto;
}

function validarUrlApi(url) {
    const destino = new URL(url);
    if (destino.protocol !== "https:" || destino.hostname !== "www.swapi.tech") {
        throw new Error("La respuesta contiene una dirección de API no permitida.");
    }
    return destino.href;
}

async function solicitarJson(url) {
    const destino = validarUrlApi(url);
    const opciones = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
        ? { signal: AbortSignal.timeout(15000) }
        : {};
    const respuesta = await fetch(destino, opciones);
    if (!respuesta.ok) {
        throw new Error("Error HTTP " + respuesta.status + " al consultar SWAPI.");
    }
    return respuesta.json();
}

async function obtenerCatalogo() {
    const catalogo = new Map();
    let siguiente = API_URL + "?page=1&limit=100";

    for (let pagina = 0; siguiente && pagina < MAX_INDEX_PAGES; pagina++) {
        const respuesta = await solicitarJson(siguiente);
        if (!Array.isArray(respuesta.results)) {
            throw new Error("La API devolvió un formato de catálogo inesperado.");
        }
        for (const nave of respuesta.results) {
            if (nave && nave.uid && nave.url && nave.name) {
                catalogo.set(String(nave.uid), {
                    uid: String(nave.uid),
                    name: String(nave.name),
                    url: validarUrlApi(nave.url)
                });
            }
        }
        siguiente = respuesta.next || null;
    }

    if (siguiente) {
        throw new Error("El catálogo supera el número de páginas admitidas.");
    }
    if (!catalogo.size) {
        throw new Error("La API no devolvió naves para mostrar.");
    }
    return [...catalogo.values()];
}

async function obtenerDetalles(nave) {
    if (state.detalles.has(nave.uid)) {
        return state.detalles.get(nave.uid);
    }
    const respuesta = await solicitarJson(nave.url);
    const propiedades = respuesta?.result?.properties;
    if (!propiedades || typeof propiedades !== "object") {
        throw new Error("La API no devolvió los datos de esta nave.");
    }
    const detalle = { ...propiedades, uid: nave.uid, name: propiedades.name || nave.name };
    state.detalles.set(nave.uid, detalle);
    return detalle;
}

function elemento(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = String(texto);
    return nodo;
}

function agregarDato(contenedor, clase, etiqueta, valor) {
    const bloque = elemento("div", clase);
    bloque.append(
        elemento("span", clase === "stat-block" ? "stat-label" : "spec-label", etiqueta),
        elemento("span", clase === "stat-block" ? "stat-value" : "spec-value", mostrarValor(valor))
    );
    contenedor.append(bloque);
}

function crearTarjeta(nave) {
    const tarjeta = elemento("article", "starship-card");
    const cabecera = elemento("div", "card-header");
    cabecera.append(
        elemento("span", "card-id", "NAV-" + String(nave.uid).padStart(4, "0")),
        elemento("h2", "card-title", nave.name),
        elemento("p", "card-subtitle", mostrarValor(nave.starship_class))
    );
    const principal = elemento("div", "card-grid");
    agregarDato(principal, "stat-block", "Modelo", nave.model);
    agregarDato(principal, "stat-block", "Fabricante", nave.manufacturer);
    agregarDato(principal, "stat-block", "Costo", nave.cost_in_credits === "unknown" ? null : nave.cost_in_credits);
    agregarDato(principal, "stat-block", "Largo (m)", nave.length);

    const especificaciones = elemento("div", "specs-section");
    [
        ["Tripulación", nave.crew],
        ["Pasajeros", nave.passengers],
        ["Velocidad atmosférica", nave.max_atmosphering_speed],
        ["Hiperimpulsor", nave.hyperdrive_rating],
        ["MGLT", nave.MGLT],
        ["Capacidad de carga", nave.cargo_capacity],
        ["Consumibles", nave.consumables]
    ].forEach(([titulo, valor]) => agregarDato(especificaciones, "spec-row", titulo, valor));

    tarjeta.append(cabecera, principal, especificaciones);
    return tarjeta;
}

function mostrarMensaje(contenedor, clase, mensaje) {
    const aviso = elemento("div", clase);
    aviso.append(elemento("p", "", mensaje));
    contenedor.replaceChildren(aviso);
}

function iniciar() {
    const campoBusqueda = document.getElementById("busqueda");
    const campoOrden = document.getElementById("orden");
    const botonActualizar = document.getElementById("actualizar");
    const estado = document.getElementById("estado");
    const contador = document.getElementById("contador");
    const principal = document.getElementById("main");
    const paginacion = document.getElementById("paginacion");
    const botonAnterior = document.getElementById("anterior");
    const botonSiguiente = document.getElementById("siguiente");
    const paginaActual = document.getElementById("pagina");

    async function mostrarResultados() {
        const version = ++state.version;
        const filtradas = filtrarYOrdenar(state.catalogo, campoBusqueda.value, campoOrden.value);
        const pagina = obtenerPagina(filtradas, state.pagina);
        state.pagina = pagina.pagina;

        contador.textContent = filtradas.length + " de " + state.catalogo.length + " naves";
        paginaActual.textContent = "Página " + pagina.pagina + " de " + pagina.totalPaginas;
        paginacion.hidden = filtradas.length <= PAGE_SIZE;
        botonAnterior.disabled = pagina.pagina === 1;
        botonSiguiente.disabled = pagina.pagina === pagina.totalPaginas;

        if (!filtradas.length) {
            principal.setAttribute("aria-busy", "false");
            estado.textContent = "No se encontraron coincidencias.";
            mostrarMensaje(principal, "empty-state", "No hay naves que coincidan con tu búsqueda.");
            return;
        }

        principal.setAttribute("aria-busy", "true");
        estado.textContent = "Cargando detalles de las naves…";
        mostrarMensaje(principal, "empty-state", "Consultando información de las naves…");

        const resultados = [];
        let fallos = 0;
        for (let indice = 0; indice < pagina.items.length; indice += DETAIL_BATCH_SIZE) {
            const grupo = pagina.items.slice(indice, indice + DETAIL_BATCH_SIZE);
            const respuestas = await Promise.allSettled(grupo.map(obtenerDetalles));
            if (version !== state.version) return;

            respuestas.forEach((respuesta, posicion) => {
                if (respuesta.status === "fulfilled") {
                    resultados.push(crearTarjeta(respuesta.value));
                } else {
                    fallos += 1;
                    const nave = grupo[posicion];
                    const aviso = elemento("article", "starship-card");
                    aviso.append(
                        elemento("h2", "card-title", nave.name),
                        elemento("p", "error-message", "No se pudieron cargar sus detalles.")
                    );
                    resultados.push(aviso);
                }
            });
        }

        if (version !== state.version) return;
        principal.replaceChildren(...resultados);
        principal.setAttribute("aria-busy", "false");
        estado.textContent = fallos
            ? "Algunos detalles no se pudieron cargar. Probá actualizar los datos."
            : "Catálogo cargado correctamente.";
    }

    async function cargarCatalogo() {
        const version = ++state.version;
        campoBusqueda.disabled = true;
        campoOrden.disabled = true;
        botonActualizar.disabled = true;
        paginacion.hidden = true;
        estado.textContent = "Cargando catálogo de SWAPI…";
        contador.textContent = "";
        principal.setAttribute("aria-busy", "true");
        mostrarMensaje(principal, "empty-state", "Consultando el catálogo de naves…");

        try {
            const catalogo = await obtenerCatalogo();
            if (version !== state.version) return;
            state.catalogo = catalogo;
            state.detalles.clear();
            state.pagina = 1;
            campoBusqueda.disabled = false;
            campoOrden.disabled = false;
            await mostrarResultados();
        } catch (error) {
            if (version !== state.version) return;
            estado.textContent = "No se pudo cargar el catálogo.";
            mostrarMensaje(principal, "error-message", "No fue posible conectarse con SWAPI. Revisá tu conexión y probá nuevamente.");
            principal.setAttribute("aria-busy", "false");
            console.error("Error al consultar las naves:", error);
        } finally {
            if (version === state.version || state.catalogo.length) {
                botonActualizar.disabled = false;
            }
        }
    }

    campoBusqueda.addEventListener("input", () => {
        state.pagina = 1;
        void mostrarResultados();
    });
    campoOrden.addEventListener("change", () => {
        state.pagina = 1;
        void mostrarResultados();
    });
    botonAnterior.addEventListener("click", () => {
        state.pagina -= 1;
        void mostrarResultados();
    });
    botonSiguiente.addEventListener("click", () => {
        state.pagina += 1;
        void mostrarResultados();
    });
    botonActualizar.addEventListener("click", () => void cargarCatalogo());

    void cargarCatalogo();
}

if (typeof document !== "undefined") {
    iniciar();
}
