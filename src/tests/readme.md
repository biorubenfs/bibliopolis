# 🧪 Arquitectura de Tests con MongoDB en Memoria

Este proyecto utiliza [`mongodb-memory-server`](https://github.com/nodkz/mongodb-memory-server) para ejecutar los tests de integración contra una base de datos MongoDB en memoria. Esto permite testear sin necesidad de levantar un Mongo real y mejora el aislamiento entre entornos.

---

## 🔍 Justificación

### ¿Por qué no basta con hacer `mongo.start()` en el global setup?

Cuando usamos Vitest (u otros frameworks similares) con `globalSetup`, ese código se ejecuta en un **proceso separado** del que luego ejecutará los tests. Eso significa:

- Aunque importes el singleton `mongo` en `global-setup.ts` y llames a `mongo.start()`, **esa instancia vive en un proceso que muere** al finalizar el setup global.
- Luego, cuando inician los tests, Vitest ejecuta cada test (o grupo de tests) en un nuevo proceso **independiente**. En ese nuevo proceso, aunque importes el mismo `mongo`, es una **instancia nueva del singleton** (porque se evalúa desde cero).

> 💡 En Node.js, los singletons no se comparten entre procesos. Cada `import` en un nuevo proceso crea su propia versión del módulo.

Por eso, si no gestionamos bien el estado compartido, obtendríamos errores como:

```
TypeError: Cannot read properties of undefined (reading 'db')
```

Esto pasa porque la conexión que creamos en `mongo.start()` dentro del `global-setup` ya no existe cuando los tests se ejecutan.

---

## 🧠 ¿Cuál fue la solución y cómo funciona?

Separar la responsabilidad en dos pasos:

### 1. `global-setup.ts` (fase única antes de los tests)
- Levanta **una única instancia** de `mongodb-memory-server`.
- Se conecta por primera vez con una instancia del singleton `Mongo`.
- Guarda el URI de la base de datos temporal en un fichero `.test-mongo-uri`.
- Arranca el servidor de la aplicación para poder testear endpoints reales.

Cuando esta fase termina, el proceso se cierra. Sin embargo, el `mongodb-memory-server` sigue corriendo en segundo plano.

### 2. `setup-tests.ts` (fase por cada worker de Vitest, se ejecuta una vez por cada proceso de test)
- Lee el URI desde el fichero `.test-mongo-uri`.
- Reutiliza el URI para conectarse a la instancia de Mongo creada en el paso anterior al hacer `mongo.start()`.
- Esto evita tener que levantar varias instancias de Mongo por cada fichero de test.

De esta forma:
- Reutilizamos la **misma instancia** de base de datos en memoria.
- Pero cada proceso de test tiene su **propia conexión MongoClient**, apuntando al mismo URI.
- Evitamos tener que levantar múltiples instancias de `mongodb-memory-server`, lo cual es lento.

---

>**NOTA IMPORTANTE**: Cada proceso (global setup, workers de Vitest) tiene su propia instancia del singleton Mongo, porque Node.js no comparte memoria entre procesos. Por eso es necesario: Guardar el URI en un fichero y Reutilizarlo desde cada worker de test.

## 🗂️ Resumen Visual

```text
Proceso 1: global-setup.ts
├── Importa `mongo` (instancia A del singleton)
├── Ejecuta `mongo.start()`:
│   ├── Levanta instancia de `mongodb-memory-server`
│   └── Se conecta con `mongoClient` al URI generado
├── Guarda el URI en `.test-mongo-uri`
└── Finaliza el proceso (la conexión se cierra,
    pero `mongodb-memory-server` sigue activo)

↓ Proceso muere

Proceso 2: setup-tests.ts (uno por worker de Vitest)
├── Importa `mongo` (nueva instancia B del singleton)
├── Lee el URI guardado
├── Llama a `mongo.setUri(uri)`
├── Llama a `mongo.start()`:
│   └── Reutiliza el URI para conectarse a `mongodb-memory-server`
└── Tests pueden ejecutar queries reales
```