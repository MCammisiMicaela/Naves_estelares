# 🚀 Naves Estelares

**Explorador de naves de Star Wars desarrollado con HTML, CSS y JavaScript.**

Desarrollé este proyecto para practicar el consumo de una API REST y el renderizado dinámico de información en una página web.

La aplicación consulta [SWAPI.tech](https://www.swapi.tech/) y muestra un catálogo de naves de Star Wars con datos como su modelo, fabricante, tripulación, pasajeros y otras especificaciones técnicas.

## Funcionalidades

- Consulta de naves mediante la API pública de Star Wars.
- Carga de los detalles de cada nave usando JavaScript asíncrono y `fetch`.
- Búsqueda por nombre, sin distinguir mayúsculas ni tildes.
- Ordenamiento alfabético o por identificador.
- Paginación de resultados.
- Mensajes de carga y de error cuando falla una solicitud.
- Diseño adaptable a computadoras y celulares.

## Tecnologías

| Tecnología | Aplicación |
| --- | --- |
| HTML5 | Estructura y contenido de la página |
| CSS3 | Diseño visual y estilos responsive |
| JavaScript | Consultas asíncronas, búsqueda, ordenamiento y navegación |
| Fetch API | Comunicación con SWAPI.tech |
| Node.js | Ejecución de pruebas automatizadas con el módulo nativo de test |
| GitHub Actions | Verificación de sintaxis y pruebas de JavaScript |

## Estructura del proyecto

```text
Naves_estelares/
├── index.html
├── css/
│   └── estilos.css
├── js/
│   └── app.mjs
├── tests/
│   └── app.test.mjs
├── .github/workflows/
│   └── tests.yml
└── README.md
```

Separé el HTML, los estilos y la lógica de JavaScript para que el código sea más fácil de leer y mantener.

## Cómo ejecutarlo

Podés clonar el repositorio:

```bash
git clone https://github.com/MCammisiMicaela/Naves_estelares.git
cd Naves_estelares
```

Como la aplicación utiliza módulos de JavaScript, abrí el proyecto desde un servidor local. Por ejemplo, con **Live Server** en Visual Studio Code o desde la terminal:

```bash
python -m http.server 5500
```

Después ingresá a **http://localhost:5500**.

La página consulta los datos al iniciar y permite buscar, ordenar y recorrer las naves del catálogo.

## Cómo funciona

Primero consulto el listado de naves de SWAPI. Con los resultados armo un catálogo y, cuando se necesita mostrar una página, obtengo los detalles de las naves correspondientes.

Los datos se presentan en tarjetas generadas con JavaScript. También guardo temporalmente los detalles ya consultados para evitar solicitudes repetidas al cambiar de página o realizar búsquedas.

Para practicar la organización del código, separé las funciones que filtran, ordenan y dividen los resultados en páginas. Estas funciones también se pueden probar de manera independiente.

## Pruebas

Incluí pruebas de búsqueda, ordenamiento, paginación y tratamiento de datos que la API no proporciona.

Si tenés instalado Node.js, podés ejecutarlas con:

```bash
node --test tests/*.test.mjs
```

También configuré GitHub Actions para ejecutar las pruebas y verificar la sintaxis de JavaScript al actualizar el repositorio.

## Autora

**[Micaela Cammisi](https://github.com/MCammisiMicaela)**
