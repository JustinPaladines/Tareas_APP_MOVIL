## Integrantes:
Justin Paladines - Josselyn Reyes

## Video Funcionamiento:

https://youtu.be/hrwKceDj1w0?si=0JbNwhPkwf3ffX3o


# ConnectChat

## Descripción del proyecto

**ConnectChat** es una aplicación móvil de mensajería desarrollada con Ionic y Angular. Su objetivo es permitir la comunicación entre usuarios mediante conversaciones individuales, ofreciendo diferentes funcionalidades para compartir información e interactuar a través de mensajes.

La aplicación integra Supabase para la gestión de usuarios, autenticación, base de datos y almacenamiento de archivos. Además, utiliza Firebase Firestore para implementar el indicador de escritura en tiempo real.

El proyecto fue desarrollado utilizando tecnologías orientadas al desarrollo de aplicaciones multiplataforma, permitiendo ejecutar la aplicación en un entorno web y generar una versión móvil mediante Capacitor.

---

## Funcionalidades principales

ConnectChat cuenta con 12 funcionalidades orientadas a facilitar la comunicación entre usuarios mediante conversaciones individuales y herramientas de interacción.

### 1. Registro de usuarios
Permite incorporar nuevos usuarios a la aplicación mediante un formulario de registro. La información de autenticación se gestiona mediante Supabase Auth, mientras que los datos adicionales del perfil se almacenan en la base de datos.

### 2. Inicio de sesión
Permite que los usuarios registrados accedan a ConnectChat utilizando sus credenciales. Supabase Auth verifica la información ingresada y administra la sesión para permitir el acceso a las diferentes funcionalidades.

### 3. Gestión y visualización de usuarios
Permite consultar los usuarios registrados en la aplicación y acceder a la información necesaria para iniciar una conversación. Los datos se obtienen desde Supabase.

### 4. Creación y acceso a conversaciones
Permite establecer conversaciones individuales entre usuarios. Cada conversación cuenta con una sala que identifica el espacio donde se intercambian los mensajes y se relacionan sus participantes.

### 5. Envío y recepción de mensajes de texto
Permite enviar mensajes escritos dentro de una conversación. Los mensajes se almacenan en la base de datos de Supabase y posteriormente pueden ser consultados por los participantes de la sala.

### 6. Edición de mensajes
Permite modificar el contenido de un mensaje previamente enviado. La modificación se refleja en la información almacenada y en la conversación.

### 7. Eliminación de mensajes
Permite eliminar mensajes de una conversación mediante las acciones disponibles en la interfaz. La operación actualiza la información correspondiente en Supabase.

### 8. Envío y visualización de imágenes
Permite seleccionar y compartir imágenes dentro de las conversaciones. Los archivos se almacenan mediante Supabase Storage y la información necesaria para mostrarlos se relaciona con sus respectivos mensajes.

### 9. Envío y descarga de archivos
Permite compartir documentos y otros archivos entre los participantes. Los archivos se almacenan en Supabase Storage y pueden consultarse desde la conversación.

### 10. Compartir ubicación
Permite enviar información de ubicación a través de una conversación para que el otro participante pueda consultarla. Esta funcionalidad utiliza las capacidades de ubicación disponibles en el dispositivo o navegador.

### 11. Reacciones a mensajes
Permite interactuar con los mensajes mediante reacciones. Estas se asocian a los mensajes correspondientes y permiten expresar una respuesta sin necesidad de enviar otro mensaje de texto.

### 12. Indicador de escritura en tiempo real
Permite mostrar cuándo el otro participante está escribiendo un mensaje. Para ello, se utiliza Firebase Firestore, que registra el estado temporal de escritura y notifica sus cambios a los usuarios que escuchan la misma sala.

Cuando un usuario comienza a escribir, se actualiza su estado en Firestore. El otro participante recibe el cambio y la aplicación muestra el indicador «Está escribiendo...». Cuando deja de escribir, el estado se elimina y el indicador desaparece.
---

## Tecnologías utilizadas

| Tecnología | Utilización |
|---|---|
| Ionic | Framework para desarrollar la interfaz de la aplicación móvil. |
| Angular | Framework utilizado para organizar la aplicación y gestionar sus componentes, páginas y lógica. |
| TypeScript | Lenguaje utilizado para implementar la lógica de la aplicación. |
| HTML | Estructura de las interfaces. |
| SCSS | Estilos y diseño visual de las pantallas. |
| Capacitor | Integración y generación de la aplicación para plataformas móviles. |
| Supabase | Autenticación, base de datos y almacenamiento de archivos. |
| PostgreSQL | Sistema de base de datos utilizado por Supabase. |
| Firebase Firestore | Comunicación del estado de escritura en tiempo real. |
| Android Studio | Entorno utilizado para trabajar con la versión Android de la aplicación. |

---

## Arquitectura y servicios

ConnectChat utiliza dos servicios principales para gestionar la información y la comunicación.

### Supabase

Supabase funciona como backend principal de la aplicación. Se utiliza para:

- Gestionar la autenticación de los usuarios.
- Almacenar información de los usuarios.
- Gestionar las salas y los participantes.
- Guardar los mensajes de las conversaciones.
- Almacenar imágenes y archivos mediante Supabase Storage.

### Firebase Firestore

Firebase Firestore se utiliza específicamente para el indicador de escritura.

Gestionar las reacciones de los mensajes.

Cuando un usuario comienza a escribir, se actualiza su estado en Firestore. El otro participante escucha estos cambios y puede visualizar el indicador «Está escribiendo...».

La información de escritura se organiza por sala de conversación, permitiendo identificar qué participante está escribiendo.

---

## Base de datos

La aplicación utiliza Supabase con PostgreSQL para almacenar la información principal.

Entre las entidades principales utilizadas se encuentran:

| Entidad | Descripción |
|---|---|
| usuarios | Información relacionada con los usuarios de la aplicación. |
| salas | Información de las conversaciones. |
| participantes | Relación entre los usuarios y las salas de conversación. |
| mensajes | Contenido de los mensajes enviados en las conversaciones. |

También se gestionan las reacciones asociadas a los mensajes y los archivos almacenados mediante Supabase Storage.

Por otra parte, Firestore mantiene los estados temporales de escritura de los participantes.

---

## Estructura general del proyecto

El proyecto sigue la organización de una aplicación Ionic con Angular.

```text
connectchat/
│
├── android/
│   └── Configuración del proyecto Android generado con Capacitor.
│
├── src/
│   │
│   ├── app/
│   │   ├── chat/
│   │   │   ├── chat.page.ts
│   │   │   ├── chat.page.html
│   │   │   └── chat.page.scss
│   │   │
│   │   ├── services/
│   │   │   └── Servicios para gestionar la lógica y comunicación
│   │   │       con los servicios externos.
│   │   │
│   │   ├── Páginas y componentes de la aplicación.
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   └── Recursos utilizados por la aplicación.
│   │
│   ├── theme/
│   │   └── Variables y estilos generales.
│   │
│   └── global.scss
│
├── capacitor.config.ts
├── angular.json
├── ionic.config.json
├── package.json
└── tsconfig.json
```

### Archivos principales del chat

| Archivo | Responsabilidad |
|---|---|
| chat.page.ts | Contiene la lógica de la pantalla de conversación, gestión de mensajes, eventos y comunicación con los servicios. |
| chat.page.html | Define la estructura visual de la conversación y sus elementos interactivos. |
| chat.page.scss | Contiene los estilos de la interfaz del chat. |

---

## Instalación y ejecución

### Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js y npm.
- Ionic CLI.
- Android Studio, si se desea trabajar con la versión Android.
- Acceso a los proyectos de Supabase y Firebase utilizados por la aplicación.

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Ingresar a la carpeta

```bash
cd connectchat
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar la aplicación

```bash
ionic serve
```

La aplicación se abrirá en el navegador para realizar pruebas.

### 5. Ejecutar en Android

Si el proyecto ya tiene Capacitor configurado y la plataforma Android agregada:

```bash
ionic build
npx cap sync android
npx cap open android
```

Desde Android Studio se puede compilar y ejecutar la aplicación en un emulador o dispositivo compatible.

---

## Configuración de servicios

Para ejecutar ConnectChat correctamente es necesario contar con la configuración correspondiente de Supabase y Firebase.

### Supabase
Se debe configurar el acceso al proyecto de Supabase y utilizar las credenciales correspondientes para establecer la conexión con la base de datos y el almacenamiento.

### Firebase
Se debe configurar el proyecto de Firebase y habilitar Firestore para permitir la comunicación del indicador de escritura.

**Importante:** Las credenciales y claves privadas no deben publicarse en el repositorio. La configuración debe realizarse de acuerdo con los archivos y mecanismos de configuración utilizados por el proyecto.

---


