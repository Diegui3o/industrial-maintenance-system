INSERT INTO usuarios (
    nombre,
    username,
    area
)
VALUES (
    'Administrador',
    'admin',
    'SISTEMA'
)
ON CONFLICT (username) DO NOTHING;