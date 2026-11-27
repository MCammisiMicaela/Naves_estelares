import test from "node:test";
import assert from "node:assert/strict";
import { normalizarTexto, filtrarYOrdenar, obtenerPagina, mostrarValor } from "../js/app.mjs";

const naves = [
    { uid: "10", name: "Millennium Falcon" },
    { uid: "2", name: "CR90 corvette" },
    { uid: "12", name: "X-wing" },
    { uid: "3", name: "Nave Águila" }
];

test("la búsqueda ignora mayúsculas y tildes", () => {
    assert.equal(normalizarTexto("  ÁGUILA  "), "aguila");
    assert.deepEqual(filtrarYOrdenar(naves, "AGUILA").map(n => n.uid), ["3"]);
});

test("filtra por nombres parciales", () => {
    assert.deepEqual(filtrarYOrdenar(naves, "Falcon").map(n => n.uid), ["10"]);
    assert.deepEqual(filtrarYOrdenar(naves, "inexistente"), []);
});

test("ordena por nombre y por identificador", () => {
    assert.deepEqual(filtrarYOrdenar(naves, "", "nombre").map(n => n.uid), ["2", "10", "3", "12"]);
    assert.deepEqual(filtrarYOrdenar(naves, "", "id").map(n => n.uid), ["2", "3", "10", "12"]);
});

test("no modifica el arreglo original al ordenar", () => {
    const original = naves.map(n => n.uid);
    filtrarYOrdenar(naves, "", "nombre");
    assert.deepEqual(naves.map(n => n.uid), original);
});

test("paginación sin omitir ni repetir elementos", () => {
    const p1 = obtenerPagina(naves, 1, 2);
    const p2 = obtenerPagina(naves, 2, 2);
    assert.equal(p1.totalPaginas, 2);
    assert.deepEqual([...p1.items, ...p2.items], naves);
});

test("controla páginas fuera de rango y colecciones vacías", () => {
    assert.equal(obtenerPagina(naves, 99, 2).pagina, 2);
    assert.equal(obtenerPagina(naves, -1, 2).pagina, 1);
    assert.deepEqual(obtenerPagina([], 1, 9).items, []);
});

test("muestra un texto claro cuando SWAPI no proporciona un dato", () => {
    for (const valor of [null, undefined, "", "unknown", "n/a"]) {
        assert.equal(mostrarValor(valor), "No disponible");
    }
    assert.equal(mostrarValor("1000"), "1000");
});
