const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((res) => rl.question(t, res))

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: false })

  if(!sock.authState.creds.registered){
    let num = await question('اكتب رقمك مع كود الدولة (مثال 2010xxxxxxx): ')
    let code = await sock.requestPairingCode(num.trim())
    console.log(`\n🔥 كود الربط بتاعك هو: ${code}\nافتح واتساب > الاجهزة المرتبطة > ربط جهاز > ربط برقم هاتف واكتب الكود ده\n`)
  }

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', ({connection})=>{
    if(connection === 'open') console.log('✅ BAROU BOT اشتغل بنجاح 💯🔥')
  })

  sock.ev.on('messages.upsert', async ({messages})=>{
    const msg = messages[0]
    if(!msg.message || msg.key.fromMe) return
    const from = msg.key.remoteJid
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()

    if(text == '.اوامر' || text == '.منيو' || text == '.بوت'){
      let up = process.uptime()
      let h = Math.floor(up/3600), m = Math.floor((up%3600)/60), s = Math.floor(up%60)
      await sock.sendMessage(from, { text: `
🔥 BAROU BOT 💯🔥
⚽ SUPPORT BAROU BOT 🔱

|  البوت : BAROU BOT 🔥 |
|  ❄️ BOT |

|  اهلا ← ${msg.pushName} : 🍃 |
|  عدد الاوامر ← 200 : 🎯 |
|  حاله البوت ← مستقر : 🟢 |
|  المطور ← DEV.BAROU : 🥷 |
|  التشغيل ← ${h}:${m}:${s} : 🚀 |
---------------------------` })
    }
  })
}
start()
