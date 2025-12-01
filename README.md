<div align="center">

# 🚀 Portafolio Unificado

### Un portafolio web moderno con dos modos de visualización: Feliz y Serio

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

[🌐 Ver Demo](#) • [📖 Documentación](#estructura-del-proyecto) • [🐛 Reportar Bug](#) • [💡 Solicitar Feature](#)

</div>

---

## ✨ Características

<div align="center">

### 🎨 **Dos Modos de Visualización**

| 🌈 Modo Feliz | 🎯 Modo Serio |
|:---:|:---:|
| Diseño interactivo con efectos espaciales | Diseño profesional y minimalista |
| Nave espacial animada | Interfaz sobria y elegante |
| Planetas y animaciones dinámicas | Enfoque en contenido y legibilidad |

</div>

### 🚀 **Funcionalidades Principales**

- ✨ **Dual Mode**: Cambio dinámico entre dos estilos completamente diferentes
- 🌍 **Multiidioma**: Soporte para Español e Inglés
- 📱 **Totalmente Responsivo**: Optimizado para móviles, tablets y desktop
- 📧 **Sistema de Contacto**: Formulario funcional con envío automático de emails
- 🎨 **UI/UX Moderna**: Diseño contemporáneo con animaciones fluidas
- ⚡ **Rendimiento Optimizado**: Construido con Next.js 14 para máxima velocidad
- 🔒 **Type-Safe**: Desarrollado completamente en TypeScript

---

## 🛠️ Tecnologías

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=flat-square&logo=nodemailer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Stefanodmm/portafolio.git
   cd portafolio
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=tu-app-password
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

---

## 🎮 Uso

### Cambiar entre Modos

Una vez que la aplicación esté corriendo, verás un **panel de configuración** (ícono de engranaje ⚙️) en la esquina inferior derecha que te permite:

- 🔄 **Cambiar entre modos**: Alterna entre "Portafolio Feliz" y "Portafolio Serio"
- 🌍 **Cambiar idioma**: Selecciona entre Español e Inglés

### Formulario de Contacto

El portafolio incluye un sistema de contacto completo:

- 📝 **Formulario intuitivo**: Campos para nombre, método de contacto (WhatsApp/Email) y mensaje
- 📧 **Envío automático**: Los mensajes se envían automáticamente por email usando Nodemailer
- 💾 **Almacenamiento local**: En desarrollo, los mensajes se guardan en archivos de texto

---

## 🏗️ Construcción para Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

### Deploy en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. ¡Listo! Vercel desplegará automáticamente tu aplicación

---

## 📁 Estructura del Proyecto

```
portafolio/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # API route para formulario de contacto
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página principal
├── components/
│   ├── ErrorBoundary.tsx         # Manejo de errores
│   ├── LanguageContext.tsx       # Contexto de idiomas
│   ├── PortfolioFeliz.tsx        # Componente modo feliz
│   ├── PortfolioModeContext.tsx   # Contexto de modo
│   ├── PortfolioSerio.tsx        # Componente modo serio
│   ├── PortfolioSerioMobile.tsx  # Versión móvil modo serio
│   └── SettingsPanel.tsx         # Panel de configuración
├── mensajes-contacto/            # Mensajes guardados (solo desarrollo)
├── .env                          # Variables de entorno (no versionado)
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Email remitente | `tu-email@gmail.com` |
| `SMTP_PASSWORD` | App Password | `tu-app-password` |

> **Nota**: Para Gmail, necesitas crear una [App Password](https://myaccount.google.com/apppasswords) en lugar de usar tu contraseña normal.

---

## 📸 Capturas de Pantalla

> _Próximamente: Agregar capturas de pantalla de ambos modos_

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Siéntete libre de:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y de uso personal.

---

## 👨‍💻 Autor

**Stefano Di Michelangelo**

- 🌐 Website: [Tu sitio web](#)
- 📧 Email: SDMM.777@proton.me
- 💼 LinkedIn: [Tu perfil](#)
- 🐙 GitHub: [@Stefanodmm](https://github.com/Stefanodmm)

---

<div align="center">

### ⭐ Si te gustó este proyecto, dale una estrella!

Made with ❤️ by [Stefano Di Michelangelo](https://github.com/Stefanodmm)

</div>
