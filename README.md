# 💰 Finance Tracker - Sistema de Control Financiero Inteligente

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Producción-green)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20(PostgreSQL)-green)
![Tailwind](https://img.shields.io/badge/Styles-Tailwind_CSS-38b2ac)

Una aplicación **Full Stack** diseñada para la gestión granular de finanzas personales. A diferencia de los rastreadores de gastos tradicionales, este sistema utiliza una metodología basada en **Bolsas (Funds)** y **Periodos Contables**, permitiendo un control exacto del flujo de efectivo real.

🔗 **[Ver Demo en Vivo](https://finance-tracket-react.vercel.app)**

---

## ✨ Características Principales

### 🔐 Seguridad y Autenticación
- **Sistema de Login/Registro:** Integrado con Supabase Auth.
- **Seguridad RLS (Row Level Security):** Aislamiento total de datos. Cada usuario solo puede leer y escribir su propia información directamente desde la base de datos PostgreSQL.

### 💼 Gestión de Fondos (Bolsas)
- **Presupuesto por Contenedores:** Crea bolsas específicas (ej. "Ahorro", "Gastos Fijos", "Diversión").
- **Control de Estado en la Nube:** Habilita o deshabilita bolsas. Las bolsas desactivadas se ocultan de los selectores de gastos para evitar errores operativos, sincronizado en tiempo real entre dispositivos.
- **Cálculo Dinámico:** Checkbox interactivo para incluir/excluir fondos específicos del cálculo de "Patrimonio Total" visual.

### 📅 Control de Periodos (Cierre de Caja)
- **Lógica de Periodos Estricta:** El sistema requiere iniciar un periodo (ej. "Marzo 2025") para permitir operaciones.
- **Cierre de Ciclo:** Al cerrar un periodo, las transacciones se archivan (Soft Delete visual) para iniciar el siguiente ciclo en limpio, manteniendo el histórico en la base de datos y preservando los saldos de los fondos.

### 🛠️ Arquitectura Técnica
- **Custom Hooks (`useFinance`):** Toda la lógica de negocio y comunicación con Supabase está desacoplada de la UI, siguiendo el patrón de diseño "Separation of Concerns".
- **Persistencia en la Nube:** Todos los cambios (incluso configuraciones de UI como bolsas activas) se guardan en PostgreSQL, permitiendo una experiencia multiplataforma (móvil/desktop) continua.

---

## 🚀 Tecnologías Utilizadas

* **Frontend:** React.js, Vite.
* **Estilos:** Tailwind CSS, React Icons.
* **Backend as a Service (BaaS):** Supabase.
* **Base de Datos:** PostgreSQL.
* **Despliegue:** Vercel (CI/CD).

---



## 🔧 Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/tu-usuario/finance-tracker-react.git](https://github.com/tu-usuario/finance-tracker-react.git)
    cd finance-tracker-react
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env.local` en la raíz y agrega tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anonima
    ```

4.  **Ejecutar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

---

## 📄 Estructura de Base de Datos (SQL)

El proyecto utiliza las siguientes tablas relacionales en PostgreSQL:

* `funds`: Almacena las bolsas de dinero y su estado (activo/inactivo).
* `transactions`: Registra ingresos y gastos vinculados a un fondo y un periodo.
* `periods`: Controla la ventana de tiempo activa (ej. Quincenas o Meses).

---

Desarrollado por **[Gabriel Rodriguez]**.
Puedes contactarme para otorgarte un usuario de prueba 
