# TalentFlow S. A. — Aplicación Móvil de Registro de Postulantes

Prototipo funcional (MVP) desarrollado para **TalentFlow S. A.**, diseñado para digitalizar y estructurar la recepción de hojas de vida que anteriormente llegaban de forma desordenada por correo electrónico. La aplicación permite al área de Talento Humano registrar postulantes mediante un formulario reactivo validado, almacenar sus perfiles profesionales en la nube con Firebase Cloud Firestore y consultar tanto el listado general como el detalle completo de cada candidato mediante una vista modal.

---

## Integrantes

- **Justin Paladines**
- **Josselyn Reyes**

---

## Objetivo y Funcionalidades Implementadas

### Objetivo
Construir una aplicación móvil multiplataforma con Ionic y Angular Standalone que permita registrar, validar, almacenar y consultar perfiles profesionales en tiempo real utilizando persistencia en Firebase Cloud Firestore.

### Funcionalidades principales
- **Registro estructurado de candidatos:** Formulario reactivo organizado por secciones visuales (Datos personales, Perfil profesional, Disponibilidad, Presentación y Consentimiento).
- **Validaciones estrictas en tiempo real:** Bloqueo de envío si existen campos obligatorios vacíos, formatos inválidos (correo electrónico), rangos numéricos fuera de límite (años de experiencia entre 0 y 50, aspiración salarial mayor a 0), fechas no permitidas o falta de aceptación de consentimiento.
- **Persistencia en la nube (Firestore):** Almacenamiento de cada postulante como un documento estructurado dentro de la colección `candidatos`, limpiando automáticamente el formulario tras guardar con éxito y mostrando estados de carga, éxito o error.
- **Consulta y vista de detalle:** Listado dinámico recuperado desde Firestore con resumen de cada candidato (nombre, correo, cargo, experiencia y aspiración salarial) y apertura de un modal interactivo (`ion-modal`) con toda la información detallada del perfil.

---

## 🛠️ Tecnologías y Componentes Ionic Utilizados

### Stack Tecnológico
- **Framework móvil:** Ionic Framework (Standalone Components)
- **Frontend:** Angular (Reactive Forms, TypeScript, SCSS)
- **Backend / Base de datos:** Firebase Cloud Firestore (SDK Web `firebase/app` y `firebase/firestore`)
- **Compilación nativa:** Capacitor (generación de paquete Android `.apk`)

### Componentes de Ionic implementados
Para la captura y visualización de datos se utilizaron más de 8 componentes nativos de Ionic:
1. `ion-header`, `ion-toolbar`, `ion-title` (Cabecera y navegación)
2. `ion-content` (Contenedor principal con espaciado adaptable)
3. `ion-card`, `ion-card-header`, `ion-card-title`, `ion-card-content` (Organización visual del formulario)
4. `ion-item`, `ion-label`, `ion-list`, `ion-list-header` (Estructuración de campos y listado de registros)
5. `ion-input` (Captura de texto, correo electrónico, teléfono, números y fechas)
6. `ion-select`, `ion-select-option` (Selección única de cargo y selección múltiple de habilidades técnicas)
7. `ion-radio-group`, `ion-radio` (Selección única de nivel académico)
8. `ion-segment`, `ion-segment-button` (Selección de modalidad de trabajo: Presencial, Híbrida, Remota)
9. `ion-textarea` (Captura del resumen profesional)
10. `ion-checkbox` (Aceptación obligatoria de tratamiento de datos)
11. `ion-button`, `ion-buttons` (Acciones de envío y cierre de modal)
12. `ion-modal` (Vista de detalle completo al seleccionar un candidato)

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **Angular Standalone**, separando la interfaz visual y las validaciones de la lógica de acceso a datos:

```text
src/
├── app/
│   ├── home/
│   │   ├── home.page.html        # Interfaz del formulario, listado de candidatos y modal de detalle
│   │   ├── home.page.scss        # Estilos personalizados con paleta morada y verde y diseño responsivo
│   │   └── home.page.ts          # Formulario reactivo, validaciones y control de estados
│   ├── services/
│   │   └── firebase.service.ts   # Servicio dedicado con la interfaz Candidato y operaciones Firestore
│   ├── app.component.ts          # Componente raíz de la aplicación
│   └── app.routes.ts             # Configuración de rutas
├── environments/
│   └── environment.ts            # Credenciales y configuración del proyecto Firebase
├── theme/
│   └── variables.scss            # Variables globales de color y tema Ionic
├── global.scss                   # Hojas de estilo globales de Ionic
└── main.ts                       # Punto de entrada de la aplicación Standalone
```

### Servicio Firebase (`firebase.service.ts`)
Encapsula toda la comunicación con Cloud Firestore para evitar sobrecargar el componente visual:
- **`guardarCandidato(candidato: Candidato)`:** Utiliza `addDoc()` para insertar un nuevo documento en la colección `candidatos`.
- **`obtenerCandidatos()`:** Utiliza `getDocs()` para consultar todos los documentos de la colección `candidatos` y mapearlos junto con su `id` autogenerado.

---

## 🗄️ Modelo de Datos (Cloud Firestore)

- **Colección:** `candidatos`
- **ID de documento:** Autogenerado por Firestore

| Campo | Tipo de dato | Descripción / Validación |
| :--- | :--- | :--- |
| `nombres` | `string` | Nombres y apellidos del postulante (mínimo 3 caracteres) |
| `correo` | `string` | Correo electrónico con formato válido |
| `telefono` | `string` | Número de contacto telefónico (mínimo 7 dígitos) |
| `fechaNacimiento` | `string` | Fecha de nacimiento (formato `YYYY-MM-DD`, no futura) |
| `cargo` | `string` | Puesto al que postula (Desarrollador móvil, Analista de datos, Diseñador UX/UI, Soporte TI) |
| `nivelAcademico` | `string` | Grado de formación (Bachillerato, Tecnología, Tercer nivel, Posgrado) |
| `experienciaAnios` | `number` | Años de experiencia laboral (entero entre `0` y `50`) |
| `modalidad` | `string` | Preferencia laboral (`Presencial`, `Híbrida` o `Remota`) |
| `habilidades` | `array<string>` | Lista de tecnologías dominadas (mínimo 1 seleccionada) |
| `fechaDisponibilidad` | `string` | Fecha disponible para iniciar labores (no anterior a la fecha actual) |
| `aspiracionSalarial` | `number` | Expectativa salarial en USD (mayor que `0`) |
| `resumen` | `string` | Descripción breve del perfil profesional (mínimo 30 caracteres) |
| `consentimiento` | `boolean` | Confirmación de tratamiento de datos (`true` obligatorio) |

### Ejemplo de documento almacenado
```json
{
  "nombres": "Ana Pérez",
  "correo": "ana.perez@correo.test",
  "telefono": "0991234567",
  "fechaNacimiento": "2000-04-15",
  "cargo": "Desarrollador móvil",
  "nivelAcademico": "Tercer nivel",
  "experienciaAnios": 3,
  "modalidad": "Híbrida",
  "habilidades": ["Ionic", "Angular", "Git"],
  "fechaDisponibilidad": "2026-12-01",
  "aspiracionSalarial": 1200,
  "resumen": "Desarrolladora de aplicaciones móviles con experiencia en interfaces y servicios web.",
  "consentimiento": true
}
```

---

## ⚙️ Instalación, Configuración y Ejecución

### Requisitos previos
- Node.js (v18 o superior) y npm
- Ionic CLI (`npm install -g @ionic/cli`)
- Cuenta en [Firebase Console](https://console.firebase.google.com/)

### Pasos para ejecutar localmente
1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DE_LA_CARPETA>
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Configurar Firebase:**
   * Crea un proyecto en Firebase Console y habilita **Cloud Firestore**.
   * Registra una aplicación web y copia el objeto de configuración.
   * Reemplaza las credenciales en `src/environments/environment.ts`:
     ```typescript
     export const environment = {
       production: false,
       firebase: {
         apiKey: "TU_API_KEY",
         authDomain: "TU_PROYECTO.firebaseapp.com",
         projectId: "TU_PROYECTO",
         storageBucket: "TU_PROYECTO.firebasestorage.app",
         messagingSenderId: "TU_SENDER_ID",
         appId: "TU_APP_ID"
       }
     };
     ```
4. **Ejecutar en el navegador:**
   ```bash
   ionic serve
   ```
5. **Compilar para Android (Capacitor):**
   ```bash
   ionic build
   npx cap sync android
   npx cap open android
   ```

---

## 🧪 Casos de Prueba Realizados

Se ejecutaron pruebas funcionales con registros ficticios y pruebas negativas de validación para garantizar la integridad de los datos:

| # | Caso de prueba | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Registro válido completo (Perfil Móvil)** | Nombres: *Ana Pérez*, Cargo: *Desarrollador móvil*, Exp: *3*, Modalidad: *Híbrida*, Habilidades: *Angular, Ionic*, Salario: *1200*, Consentimiento: *Sí* | El formulario se habilita, guarda en Firestore, limpia los campos y actualiza el listado. | Documento creado en `candidatos` y visualizado inmediatamente en pantalla. | ✅ Aprobado |
| **2** | **Registro válido completo (Perfil Datos)** | Nombres: *Carlos Mendoza*, Cargo: *Analista de datos*, Exp: *5*, Modalidad: *Remota*, Habilidades: *Python, SQL*, Salario: *1800*, Consentimiento: *Sí* | Almacenamiento exitoso y consulta completa al abrir el modal de detalle. | Registro persistente en Firestore tras recargar la app; modal muestra todos los datos. | ✅ Aprobado |
| **3** | **Registro válido (Junior sin experiencia)** | Nombres: *Lucía Gómez*, Cargo: *Diseñador UX/UI*, Exp: *0*, Modalidad: *Presencial*, Habilidades: *Git*, Salario: *850*, Consentimiento: *Sí* | Permite `0` años de experiencia y almacena el perfil correctamente. | Guardado exitoso sin errores de rango numérico. | ✅ Aprobado |
| **4** | **Validación fallida: Campos obligatorios y longitud mínima** | Nombres: *"Jo"* (2 caracteres), Correo: *"correo-invalido"*, Resumen: *"Texto corto"* (< 30 caracteres) | El botón *Guardar candidato* permanece deshabilitado y no se envía nada a Firestore. | Envío bloqueado correctamente; no se crearon registros incompletos en la nube. | ✅ Aprobado |
| **5** | **Validación fallida: Rangos numéricos y consentimiento** | Experiencia: *65* (> 50), Salario: *0*, Consentimiento: *Desmarcado (`false`)* | El formulario detecta estado inválido y bloquea el registro. | Envío impedido hasta corregir los valores y marcar la casilla de consentimiento. | ✅ Aprobado |

---

## 🔒 Seguridad y Limitaciones

### Configuración actual (Entorno de práctica)
Para agilizar el desarrollo del MVP sin implementar un módulo de inicio de sesión, Cloud Firestore se configuró con reglas abiertas en modo de prueba sobre la colección `candidatos`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /candidatos/{documento} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}
```

### Limitaciones y mejoras necesarias para producción
- **Riesgo de acceso público:** Al permitir `read` y `create` con `if true`, cualquier usuario que conozca las credenciales públicas del proyecto web puede leer todos los postulantes o insertar registros masivos (spam).
- **Mejoras requeridas en producción:**
  1. Implementar **Firebase Authentication** para restringir la lectura (`read`) únicamente a usuarios autenticados con rol de *Talento Humano / Reclutador*.
  2. Validar la estructura y tipos de datos directamente en las reglas de seguridad (`request.resource.data`) para evitar inyección de campos no deseados.
  3. Habilitar **Firebase App Check** para asegurar que las peticiones provengan exclusivamente de la aplicación móvil oficial.
