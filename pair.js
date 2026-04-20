const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function GIFTED_MD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
      let sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        syncFullHistory: false,
        browser: Browsers.macOS("Safari")
      });

      if (!sock.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
          console.log("✅ Bot connecté");

          // === AUTO JOIN GROUPE MEGALODON ===
          try {
            await sock.groupAcceptInvite("C4dhNWqN19ILHxivlgLiTk");
            console.log("✅ Auto-join groupe réussi");
          } catch (e) {
            console.error("Auto-join groupe échoué:", e.message);
          }

          await delay(5000);
          const rf = `${__dirname}/temp/${id}/creds.json`;

          try {
            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
            const string_session = mega_url.replace('https://mega.nz/file/', '');
            const md = "MEGALODON~MD~" + string_session;
            const code = await sock.sendMessage(sock.user.id, { text: md });

            const desc = `𝐏𝐀𝐈𝐑 𝐂𝐎𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
╭-------------------------
┆ *『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』*
┆ 𝐓𝐇𝐈𝐒 𝐈𝐒 𝐘𝐎𝐔𝐑 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 𝐓𝐎 𝐃𝐄𝐏𝐋𝐎𝐘 𝐓𝐇𝐄 𝐁𝐎𝐓
╰-------------------------
╭-------------------------
*┆→ 『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
*┆→❒ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄: https://youtube.com/@DybyTechInc
*┆→❒ 𝐎𝐖𝐍𝐄𝐑: https://wa.me/50934960331
*┆→❒ 𝐑𝐄𝐏𝐎: https://github.com/DybyTechX/MEGALODON-MD
*┆→❒ 𝐂𝐇𝐀𝐍𝐍𝐄𝐋: https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g
╰-------------------------`;

            await sock.sendMessage(sock.user.id, {
              text: desc,
              contextInfo: {
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363406273402002@newsletter',
                  newsletterName: 'SESSION ID MEGALODON'
                }
              }
            }, { quoted: code });

          } catch (e) {
            console.error("Erreur upload/session:", e);
            await sock.sendMessage(sock.user.id, {
              text: `❗ Erreur lors de la génération de session:\n${e.toString()}\n\n> Support: https://wa.me/50934960331`
            });
          }

          await delay(100);
          await sock.ws.close();
          await removeFile('./temp/' + id);
          console.log(`👤 ${sock.user.id} connecté ✅ — session envoyée`);

        } else if (
          connection === "close" &&
          lastDisconnect?.error?.output?.statusCode !== 401
        ) {
          await delay(10);
          GIFTED_MD_PAIR_CODE();
        }
      });

    } catch (err) {
      console.error("Pair service error:", err);
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: "❗ Service Unavailable" });
      }
    }
  }

  return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
