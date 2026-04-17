# 🔊 Sons do Food Truck Alert

Coloque os arquivos de som nesta pasta: `apps/mobile/assets/sounds/`

## Arquivos necessários

| Arquivo | Uso | Duração recomendada |
|---|---|---|
| `ready.mp3` | Cliente: pedido pronto 🔔 | 2–3 segundos |
| `new-order.mp3` | Cozinha: novo pedido recebido | 1–2 segundos |
| `status.mp3` | Cliente: status atualizado | 0.5–1 segundo |
| `ready.wav` | Android notification channel | mesma do .mp3 |

## Onde encontrar sons gratuitos

- **Freesound.org** — buscar "notification", "bell", "ding"
- **Mixkit.co/free-sound-effects** — sons de notificação
- **Zapsplat.com** — categoria "notifications & alerts"

## Sons recomendados por tipo

### `ready.mp3` (pedido pronto)
- Tom alegre e distinto — ex: sino duplo, chime
- Audível em ambiente barulhento (food truck tem muito ruído!)
- Normalize em -3dB

### `new-order.mp3` (cozinha — novo pedido)  
- Tom de alerta curto — ex: "ding ding"
- Deve chamar atenção mesmo com outros sons

### `status.mp3` (status atualizado)
- Tom suave — ex: pop, tick
- Não precisa ser chamativo

## Converter para .wav (Android channel)
```bash
ffmpeg -i ready.mp3 ready.wav
```
