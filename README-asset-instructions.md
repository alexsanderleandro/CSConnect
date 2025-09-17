Instruções para mover/copy o background.jpg para public/assets

Contexto
- O repositório inclui a imagem em src/assets/background.jpg para que o bundler (Create React App) possa importá-la nos componentes.
- Você optou por também disponibilizar a imagem em public/assets/background.jpg (opção A). Como arquivos binários não podem ser criados por patch aqui, siga as instruções abaixo.

Opção rápida (PowerShell)
1. Abra PowerShell na raiz do projeto (onde está package.json).
2. Execute:
   .\scripts\copy-assets.ps1

Isso tentará copiar src/assets/background.jpg para public/assets/background.jpg.

Se preferir copiar manualmente:
1. Crie a pasta public/assets caso não exista.
2. Copie o arquivo src/assets/background.jpg para public/assets/background.jpg.

Notas
- Após copiar para public/assets, referências absolutos como /assets/background.jpg continuarão funcionando.
- Eu também atualizei os componentes para usar import (opção B). Ambos funcionam; se você preferir servir do public, a import ainda funcionará mas criará uma cópia no build final.

Por fim
- Rode npm start para desenvolvimento e verifique se a imagem aparece nas telas de Login, Registro, Chat e Admin.
- Rode npm test para garantir que os testes continuam passando.
