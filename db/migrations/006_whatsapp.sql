CREATE TABLE whatsapp_instancias (
    id SERIAL PRIMARY KEY,

    nombre TEXT NOT NULL,

    telefono TEXT UNIQUE,

    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (
            estado IN (
                'pendiente',
                'conectado',
                'desconectado',
                'error'
            )
        ),

    ruta_sesion TEXT NOT NULL,

    creado_en TIMESTAMPTZ DEFAULT NOW(),

    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);