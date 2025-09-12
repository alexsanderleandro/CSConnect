Schema Editor
content
(
text
)
Conteúdo da mensagem de texto

message_type
(
text
)
Tipo da mensagem

Default: "text"
Options: text, image, video, audio, document
file_url
(
text
)
URL do arquivo anexado

file_name
(
text
)
Nome original do arquivo

file_size
(
number
)
Tamanho do arquivo em bytes

sender_name
(
text
, required
)
Nome do remetente

sender_id
(
text
)
ID do usuário remetente

recipient_id
(
text
)
ID do usuário destinatário (null para mensagem em grupo)

conversation_id
(
text
)
ID da conversa

Default: "main"
is_private
(
boolean
)
Se é uma conversa privada

Default: false