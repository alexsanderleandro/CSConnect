User Schema Editor
role
(
text
, required
)
Cargo do usuário no sistema

Default: "pending"
Options: admin, user, pending
email
(
text
, required
)
The email of the user

full_name
(
text
, required
)
The full name of the user

last_seen
(
date-time
, required
)
Timestamp da última vez que o usuário esteve ativo

is_active
(
boolean
)
Se a conta do usuário está ativa e aprovada

Default: false
approval_notification_sent
(
boolean
)
Se a notificação de aprovação já foi enviada ao admin

Default: false