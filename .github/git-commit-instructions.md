Idioma: Español.
Verbo: Modo imperativo, presente. No usar pasado.
Limite de caracteres: 50 para el título, 72 para la descripción.
Separación: Una línea en blanco entre el título y la descripción.
Identificador: Siempre incluir ID de la tarea o issue (RT-XXXX) si existe.
Scope: Incluir si es relevante (por ejemplo, componente o módulo afectado).
Cambios menores: Usar "chore" o "docs" según corresponda.
Cambios incompatibles: Usar "BREAKING CHANGE" en la descripción.
Formato cuerpo: Explicar el "qué" y el "por qué". Usar viñetas si es necesar¢io.
Ajustar ancho: Limitar líneas a 72 caracteres.

## Tipos de commits (conventional commits):

| Tipo     | Uso                                    |
| -------- | -------------------------------------- |
| feat     | Nueva funcionalidad                    |
| fix      | Corrección de error                    |
| chore    | Tarea menor, mantenimiento             |
| docs     | Documentación                          |
| refactor | Refactorización                        |
| style    | Cambios de formato, sin afectar lógica |
| test     | Añadir o modificar tests               |
| perf     | Mejoras de rendimiento                 |
| ci       | Cambios en CI/CD                       |
| build    | Cambios en dependencias o build        |
| revert   | Revertir cambios                       |

## gitemoji asignados:

Usar un solo emoji al inicio del titulo del commit.

c| Gitmoji                         | Tipo (type) | Descripción (ES)                                       | Ejemplo                                                   |
| ------------------------------- | ------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| ✨ :sparkles:                  | feat        | Nueva funcionalidad                                    | ✨ feat(auth): agrega validación de token                |
| 🐛 :bug:                      | fix         | Corrección de errores                                  | 🐛 fix(api): corrige bug en creación de usuario         |
| 📝 :memo:                     | docs        | Cambios en documentación                               | 📝 docs(readme): actualiza instrucciones de instalación |
| 🎨 :art:                      | style       | Cambios de formato/estilo de código sin alterar lógica | 🎨 style(forms): mejora indentación y espaciado         |
| ♻ :recycle:                  | refactor    | Refactorización de código                              | ♻ refactor(utils): optimiza función de parseo          |
| ⚡ :zap:                       | perf        | Mejoras de rendimiento                                 | ⚡ perf(db): reduce tiempo de respuesta de consultas     |
| ✅ :white_check_mark:          | test        | Añadir o modificar tests                               | ✅ test(auth): añade test de expiración de sesión        |
| 📦 :package:                  | build       | Cambios en el sistema de build o dependencias          | 📦 build(deps): actualiza versión de axios              |
| 🔧 :wrench:                   | chore       | Tareas menores o configuración                         | 🔧 chore(ci): actualiza workflow de despliegue          |
| 💄 :lipstick:                 | style (UI)  | Cambios de estilos visuales                            | 💄 style(ui): ajusta colores de botones                 |
| 🔥 :fire:                     | remove      | Eliminar código o archivos                             | 🔥 remove: elimina módulo obsoleto de pagos             |
| 🚑 :ambulance:                | hotfix      | Corrección crítica en producción                       | 🚑 hotfix(api): repara endpoint caído                   |
| 🚀 :rocket:                   | deploy      | Preparar o realizar despliegue                         | 🚀 deploy: versión 1.2.0 a producción                   |
| ⏪ :rewind:                    | revert      | Revertir cambios previos                               | ⏪ revert: revierte commit por error                     |
| 📈 :chart_with_upwards_trend: | analytics   | Añadir o mejorar métricas/analytics                    | 📈 analytics: agrega seguimiento de clics               |
| 🔒 :lock:                     | security    | Cambios de seguridad                                   | 🔒 security(auth): mejora en hashing de contraseñas     |
| 🌐 :globe_with_meridians:     | i18n        | Cambios en internacionalización                        | 🌐 i18n: añade soporte para idioma portugués            |
| 🚧 :construction:             | wip         | Trabajo en progreso                                    | 🚧 wip: módulo de reportes                              |
| 🗃 :card_file_box:            | db          | Cambios en base de datos o migraciones                 | 🗃 db: añade índice a tabla de usuarios                 |
| 🧪 :test_tube:                | experiment  | Pruebas o experimentos temporales                      | 🧪 experiment: prueba de nueva librería                 |


## ejemplos:


:gitmoji: tipo(scope opcional): descripción breve

[cuerpo opcional con más detalles, usando viñetas si son varios puntos]



✨ feat(auth): agrega validación JWT #123

- Añade middleware de autenticación
- Previene acceso sin token
- BREAKING CHANGE: requiere configuración nueva

