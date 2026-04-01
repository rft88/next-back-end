# Back-end

API Node.js + Express.

## Rodar localmente
```bash
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente

- `RIOT_API_KEY` → chave da API da Riot
- `PORT` → porta do servidor
- `CLIENT_ORIGIN` → origem liberada no CORS

Exemplo:
```env
RIOT_API_KEY=coloque_sua_chave_aqui
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```
