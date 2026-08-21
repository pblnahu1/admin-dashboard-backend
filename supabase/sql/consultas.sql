
-- para actualizar los metadatos del usuario en la tabla auth.users
update auth.users
set
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'full_name', 'Nombre actualizado',
      'avatar_url', 'https://ejemplo.com/avatar.png',
      'preferred_language', 'es',
      'preferred_theme', 'light'
    ),
  updated_at = now()
where id = '81340391-382f-4c49-a729-a8f67a6b086b';

-- para actualizar la contraseña del usuario en la tabla auth.users
select id, email
from auth.users
where email = 'admin@gmail.com';


-- para actualizar la contraseña del usuario en la tabla auth.users
select
  id,
  email,
  raw_user_meta_data,
  updated_at
from auth.users
where id = '81340391-382f-4c49-a729-a8f67a6b086b';