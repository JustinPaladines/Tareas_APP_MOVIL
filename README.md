# TalentFlow S. A. — Aplicación Móvil de Registro de Postulantes

Prototipo funcional (MVP) desarrollado para **TalentFlow S. A.**[cite: 1], diseñado para digitalizar y estructurar la recepción de hojas de vida que anteriormente llegaban de forma desordenada por correo electrónico. La aplicación permite al área de Talento Humano registrar postulantes mediante un formulario reactivo validado[cite: 1], almacenar sus perfiles profesionales en la nube con Firebase Cloud Firestore[cite: 1] y consultar tanto el listado general como el detalle completo de cada candidato mediante una vista modal[cite: 1, 2].

---

## Integrantes

* **Justin Paladines**
* **Josselyn Reyes**

---

## Objetivo y Funcionalidades Implementadas

### Objetivo
Construir una aplicación móvil multiplataforma con Ionic y Angular Standalone que permita registrar, validar, almacenar y consultar perfiles profesionales en tiempo real utilizando persistencia en Firebase Cloud Firestore[cite: 1].

### Funcionalidades principales
* **Registro estructurado de candidatos:** Formulario reactivo organizado por secciones visuales (Datos personales, Perfil profesional, Disponibilidad, Presentación y Consentimiento)[cite: 1].
* **Validaciones estrictas en tiempo real:** Bloqueo de envío si existen campos obligatorios vacíos, formatos inválidos (correo electrónico), rangos numéricos fuera de límite (años de experiencia entre 0 y 50, aspiración salarial mayor a 0), fechas no permitidas o falta de aceptación de consentimiento[cite: 1].
* **Persistencia en la nube (Firestore):** Almacenamiento de cada postulante como un documento estructurado dentro de la colección `candidatos`, limpiando automáticamente el formulario tras guardar con éxito y mostrando estados de carga, éxito o error[cite: 1, 2].
* **Consulta y vista de detalle:** Listado dinámico recuperado desde Firestore con resumen de cada candidato (nombre, correo, cargo, experiencia y aspiración salarial) y apertura de un modal interactivo (`ion-modal`) con toda la información detallada del perfil[cite: 1, 2].

---

## 🛠️ Tecnologías y Componentes Ionic Utilizados

### Stack Tecnológico
* **Framework móvil:** Ionic Framework (Standalone Components)[cite: 1]
* **Frontend:** Angular (Reactive Forms, TypeScript, SCSS)[cite: 1]
* **Backend / Base de datos:** Firebase Cloud Firestore (SDK Web `firebase/app` y `firebase/firestore`)[cite: 1]
* **Compilación nativa:** Capacitor (generación de paquete Android `.apk`)

### Componentes de Ionic implementados
Para la captura y visualización de datos se utilizaron más de 8 componentes nativos de Ionic[cite: 1]:
1. `ion-header`, `ion-toolbar`, `ion-title` (Cabecera y navegación)
2. `ion-content` (Contenedor principal con espaciado adaptable)
3. `ion-card`, `ion-card-header`, `ion-card-title`, `ion-card-content` (Organización visual del formulario)[cite: 2]
4. `ion-item`, `ion-label`, `ion-list`, `ion-list-header` (Estructuración de campos y listado de registros)[cite: 2]
5. `ion-input` (Captura de texto, correo electrónico, teléfono, números y fechas)[cite: 1, 2]
6. `ion-select`, `ion-select-option` (Selección única de cargo y selección múltiple de habilidades técnicas)[cite: 1, 2]
7. `ion-radio-group`, `ion-radio` (Selección única de nivel académico)[cite: 1, 2]
8. `ion-segment`, `ion-segment-button` (Selección de modalidad de trabajo: Presencial, Híbrida, Remota)[cite: 1, 2]
9. `ion-textarea` (Captura del resumen profesional)[cite: 1, 2]
10. `ion-checkbox` (Aceptación obligatoria de tratamiento de datos)[cite: 1, 2]
11. `ion-button`, `ion-buttons` (Acciones de envío y cierre de modal)[cite: 2]
12. `ion-modal` (Vista de detalle completo al seleccionar un candidato)[cite: 1, 2]

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **Angular Standalone**, separando la interfaz visual y las validaciones de la lógica de acceso a datos[cite: 1]:

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
Encapsula toda la comunicación con Cloud Firestore para evitar sobrecargar el componente visual[cite: 1]:
* **`guardarCandidato(candidato: Candidato)`:** Utiliza `addDoc()` para insertar un nuevo documento en la colección `candidatos`[cite: 1].
* **`obtenerCandidatos()`:** Utiliza `getDocs()` para consultar todos los documentos de la colección `candidatos` y mapearlos junto con su `id` autogenerado[cite: 1].

---

## 🗄️ Modelo de Datos (Cloud Firestore)

* **Colección:** `candidatos`[cite: 1, 2]
* **ID de documento:** Autogenerado por Firestore[cite: 1]

| Campo | Tipo de dato | Descripción / Validación |
| :--- | :--- | :--- |
| `nombres` | `string` | Nombres y apellidos del postulante (mínimo 3 caracteres)[cite: 1, 2] |
| `correo` | `string` | Correo electrónico con formato válido[cite: 1, 2] |
| `telefono` | `string` | Número de contacto telefónico (mínimo 7 dígitos)[cite: 1, 2] |
| `fechaNacimiento` | `string` | Fecha de nacimiento (formato `YYYY-MM-DD`, no futura)[cite: 1, 2] |
| `cargo` | `string` | Puesto al que postula (Desarrollador móvil, Analista de datos, Diseñador UX/UI, Soporte TI)[cite: 1, 2] |
| `nivelAcademico` | `string` | Grado de formación (Bachillerato, Tecnología, Tercer nivel, Posgrado)[cite: 1, 2] |
| `experienciaAnios` | `number` | Años de experiencia laboral (entero entre `0` y `50`)[cite: 1, 2] |
| `modalidad` | `string` | Preferencia laboral (`Presencial`, `Híbrida` o `Remota`)[cite: 1, 2] |
| `habilidades` | `array<string>` | Lista de tecnologías dominadas (mínimo 1 seleccionada)[cite: 1, 2] |
| `fechaDisponibilidad` | `string` | Fecha disponible para iniciar labores (no anterior a la fecha actual)[cite: 1, 2] |
| `aspiracionSalarial` | `number` | Expectativa salarial en USD (mayor que `0`)[cite: 1, 2] |
| `resumen` | `string` | Descripción breve del perfil profesional (mínimo 30 caracteres)[cite: 1, 2] |
| `consentimiento` | `boolean` | Confirmación de tratamiento de datos (`true` obligatorio)[cite: 1, 2] |

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
```[cite: 2]

---

## ⚙️ Instalación, Configuración y Ejecución

### Requisitos previos
* Node.js (v18 o superior) y npm
* Ionic CLI (`npm install -g @ionic/cli`)[cite: 1]
* Cuenta en [Firebase Console](https://console.firebase.google.com/)[cite: 1]

### Pasos para ejecutar localmente
1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DE_LA_CARPETA>
   ```[cite: 1]
2. **Instalar dependencias:**
   ```bash
   npm install
   ```[cite: 1]
3. **Configurar Firebase:**
   * Crea un proyecto en Firebase Console y habilita **Cloud Firestore**[cite: 1].
   * Registra una aplicación web y copia el objeto de configuración[cite: 1].
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
     ```[cite: 1]
4. **Ejecutar en el navegador:**
   ```bash
   ionic serve
   ```[cite: 1]
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
| **1** | **Registro válido completo (Perfil Móvil)** | Nombres: *Ana Pérez*, Cargo: *Desarrollador móvil*, Exp: *3*, Modalidad: *Híbrida*, Habilidades: *Angular, Ionic*, Salario: *1200*, Consentimiento: *Sí* | El formulario se habilita, guarda en Firestore, limpia los campos y actualiza el listado[cite: 1, 2]. | Documento creado en `candidatos` y visualizado inmediatamente en pantalla. | ✅ Aprobado |
| **2** | **Registro válido completo (Perfil Datos)** | Nombres: *Carlos Mendoza*, Cargo: *Analista de datos*, Exp: *5*, Modalidad: *Remota*, Habilidades: *Python, SQL*, Salario: *1800*, Consentimiento: *Sí* | Almacenamiento exitoso y consulta completa al abrir el modal de detalle[cite: 1]. | Registro persistente en Firestore tras recargar la app; modal muestra todos los datos. | ✅ Aprobado |
| **3** | **Registro válido (Junior sin experiencia)** | Nombres: *Lucía Gómez*, Cargo: *Diseñador UX/UI*, Exp: *0*, Modalidad: *Presencial*, Habilidades: *Git*, Salario: *850*, Consentimiento: *Sí* | Permite `0` años de experiencia y almacena el perfil correctamente[cite: 1]. | Guardado exitoso sin errores de rango numérico. | ✅ Aprobado |
| **4** | **Validación fallida: Campos obligatorios y longitud mínima** | Nombres: *"Jo"* (2 caracteres), Correo: *"correo-invalido"*, Resumen: *"Texto corto"* (< 30 caracteres) | El botón *Guardar candidato* permanece deshabilitado y no se envía nada a Firestore[cite: 1]. | Envío bloqueado correctamente; no se crearon registros incompletos en la nube[cite: 1]. | ✅ Aprobado |
| **5** | **Validación fallida: Rangos numéricos y consentimiento** | Experiencia: *65* (> 50), Salario: *0*, Consentimiento: *Desmarcado (`false`)* | El formulario detecta estado inválido y bloquea el registro[cite: 1]. | Envío impedido hasta corregir los valores y marcar la casilla de consentimiento[cite: 1]. | ✅ Aprobado |

---

## 🔒 Seguridad y Limitaciones

### Configuración actual (Entorno de práctica)
Para agilizar el desarrollo del MVP sin implementar un módulo de inicio de sesión[cite: 1], Cloud Firestore se configuró con reglas abiertas en modo de prueba sobre la colección `candidatos`[cite: 1]:

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
```[cite: 1]

### Limitaciones y mejoras necesarias para producción
* **Riesgo de acceso público:** Al permitir `read` y `create` con `if true`, cualquier usuario que conozca las credenciales públicas del proyecto web puede leer todos los postulantes o insertar registros masivos (spam)[cite: 1].
* **Mejoras requeridas en producción:**
  1. Implementar **Firebase Authentication** para restringir la lectura (`read`) únicamente a usuarios autenticados con rol de *Talento Humano / Reclutador*.
  2. Validar la estructura y tipos de datos directamente en las reglas de seguridad (`request.resource.data`) para evitar inyección de campos no deseados.
  3. Habilitar **Firebase App Check** para asegurar que las peticiones provengan exclusivamente de la aplicación móvil oficial.

---
