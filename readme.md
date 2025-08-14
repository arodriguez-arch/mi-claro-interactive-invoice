# Mi Claro Interactive Invoice

[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

> Componente web interactivo para mostrar y gestionar facturas en el sistema de facturación de Claro. Construido con Stencil para máxima compatibilidad entre frameworks.

## 🚀 Instalación Rápida

```bash
npm install intellisoft-mi-claro-interactive-invoice
```

## 📋 Uso Básico

### Vanilla JavaScript / HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/intellisoft-mi-claro-interactive-invoice@latest/dist/mi-claro-interactive-invoice/mi-claro-interactive-invoice.esm.js"></script>
</head>
<body>
  <mi-claro-interactive-invoice></mi-claro-interactive-invoice>
</body>
</html>
```

### React

```jsx
import { defineCustomElements } from 'intellisoft-mi-claro-interactive-invoice/loader';

// Inicializar una vez en tu app
defineCustomElements();

function App() {
  const handleInvoicePaid = (event) => {
    console.log('Factura pagada:', event.detail);
  };

  return (
    <mi-claro-interactive-invoice 
      onInvoicePaid={handleInvoicePaid}>
    </mi-claro-interactive-invoice>
  );
}
```

### Angular

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { defineCustomElements } from 'intellisoft-mi-claro-interactive-invoice/loader';

defineCustomElements();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }

// component.ts
@Component({
  template: `
    <mi-claro-interactive-invoice 
      (invoicePaid)="onInvoicePaid($event)">
    </mi-claro-interactive-invoice>
  `
})
export class InvoiceComponent {
  onInvoicePaid(event: CustomEvent) {
    console.log('Factura pagada:', event.detail);
  }
}
```

### Vue 3

```vue
<template>
  <mi-claro-interactive-invoice 
    @invoice-paid="handleInvoicePaid">
  </mi-claro-interactive-invoice>
</template>

<script setup>
import { defineCustomElements } from 'intellisoft-mi-claro-interactive-invoice/loader';

defineCustomElements();

const handleInvoicePaid = (event) => {
  console.log('Factura pagada:', event.detail);
};
</script>
```

## 🛠️ Propiedades

| Propiedad | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| *Por definir* | - | *Se agregarán según lógica de negocio* | - |

## 📡 Eventos

| Evento | Descripción | Detalle |
|--------|-------------|---------|
| `invoicePaid` | Se emite cuando se completa un pago | `{ invoiceId: string, amount: number, method: string }` |
| `invoiceDetailToggled` | Se emite al expandir/contraer detalles | `{ invoiceId: string, isOpen: boolean }` |

## 🎨 Personalización

El componente soporta CSS Custom Properties para personalización:

```css
mi-claro-interactive-invoice {
  --invoice-primary-color: #e60028;
  --invoice-background: #ffffff;
  --invoice-border-radius: 8px;
  /* Más variables por definir según diseño */
}
```

## 💻 Desarrollo

### Requisitos
- Node.js >= 14.x
- npm >= 6.x

### Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Generar nuevo componente
npm run generate
```

## 📁 Estructura del Proyecto

```
mi-claro-interactive-invoice/
├── src/
│   ├── components/
│   │   └── mi-claro-interactive-invoice/
│   │       ├── mi-claro-interactive-invoice.tsx
│   │       ├── mi-claro-interactive-invoice.css
│   │       └── readme.md
│   └── index.ts
├── examples/              # Ejemplos de integración
│   ├── vanilla-js/
│   ├── react-app/
│   ├── angular-app/
│   └── vue-app/
└── dist/                 # Archivos construidos
```

## 📚 Documentación

- 📖 [Guía de Implementación](./IMPLEMENTATION_GUIDE.md) - Integración detallada por framework
- 🚀 [Estrategia de Distribución](./DISTRIBUTION_README.md) - Plan de publicación y versionado
- 💻 [Guía de Desarrollo](./CLAUDE.md) - Arquitectura y configuración interna
- 📁 [Ejemplos](./examples/) - Código funcional para cada framework

## 🤝 Contribución

*Sección por definir según políticas internas de Claro*

## 📄 Licencia

MIT © IntelliSoft

---

**Nota**: Este componente está en desarrollo activo. Las propiedades, eventos y estilos se definirán según los requerimientos específicos del negocio de Claro.