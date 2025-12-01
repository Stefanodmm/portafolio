# Portafolio Unificado

Un portafolio web unificado que permite cambiar entre dos versiones diferentes:

- **Portafolio Feliz**: Diseño interactivo con efectos espaciales, nave espacial, planetas y animaciones
- **Portafolio Serio**: Diseño profesional y minimalista con un enfoque sobrio

## Características

- ✨ Dos estilos de portafolio en una sola aplicación
- 🔄 Cambio dinámico entre versiones con un botón toggle
- 💾 Persistencia de preferencia en localStorage
- 📱 Diseño totalmente responsivo
- ⚡ Construido con Next.js 14 y React 18

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

Una vez que la aplicación esté corriendo, verás un panel de configuración (ícono de engranaje) en la esquina inferior derecha que te permite:
- Cambiar entre el "Portafolio Feliz" y el "Portafolio Serio"
- Cambiar el idioma (Español/Inglés)

## Formulario de Contacto

El portafolio incluye un sistema de contacto que:
- Guarda los mensajes en archivos de texto en `mensajes-contacto/`
- Envía emails automáticamente usando Nodemailer
- Requiere configuración de variables de entorno (ver `.env.example`)

## Construcción para Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
proyecto/
├── app/
│   ├── page.tsx          # Página principal con sistema de toggle
│   ├── layout.tsx        # Layout raíz
│   ├── globals.css       # Estilos globales
│   └── api/
│       └── contact/
│           └── route.ts  # API route para formulario de contacto
├── components/
│   ├── PortfolioFeliz.tsx        # Componente del portafolio feliz
│   ├── PortfolioSerio.tsx        # Componente del portafolio serio
│   ├── PortfolioSerioMobile.tsx   # Versión móvil del portafolio serio
│   ├── PortfolioModeContext.tsx   # Contexto para manejar el modo
│   ├── LanguageContext.tsx        # Contexto para manejar idiomas
│   ├── SettingsPanel.tsx          # Panel de configuración
│   └── ErrorBoundary.tsx          # Manejo de errores
├── mensajes-contacto/             # Mensajes guardados del formulario
├── package.json
├── tsconfig.json
└── next.config.js
```

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- CSS-in-JS (inline styles)
