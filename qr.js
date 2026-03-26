const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();

    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let sock = makeWASocket({
                // FIX: auth complet avec makeCacheableSignalKeyStore (était juste `auth: state`)
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) await res.end(await QRCode.toBuffer(qr));

                if (connection == "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "MEGALODON~MD~" + string_session;
                        let code = await sock.sendMessage(sock.user.id, { text: md });

                        let desc = `𝐐𝐑 𝐂𝐎𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
╔════◇
║ *『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』*
║ 𝐓𝐇𝐈𝐒 𝐈𝐒 𝐘𝐎𝐔𝐑 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 𝐓𝐎 𝐃𝐄𝐏𝐋𝐎𝐘 𝐓𝐇𝐄 𝐁𝐎𝐓
╚══════════════════════╝
╔═════◇
║  『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
║❒ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄: https://youtube.com/@dybytech00
║❒ 𝐎𝐖𝐍𝐄𝐑: https://wa.me/50934960331
║❒ 𝐑𝐄𝐏𝐎: https://github.com/DybyTech/MEGALODON-MD
║❒ 𝐂𝐇𝐀𝐍𝐍𝐄𝐋: https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g
╚══════════════════════╝`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                forwardingScore: 2,
                                isForwarded: true,
                                mentionedJid: [sock.user.id],
                                forwardedNewsletterMessageInfo: {
                                    newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐓𝐆",
                                    newsletterJid: "120363406273402002@newsletter",
                                    serverMessageId: 143
                                }
                            }
                        }, { quoted: code });

                    } catch (e) {
                        // FIX: await manquant sur sendMessage (ddd était une Promise non résolue)
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.message || String(e) });

                        let desc = `𝐐𝐑 𝐂𝐎𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
╔════◇
║ *『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐄𝐑𝐑𝐄𝐔𝐑 』*
║ Réessayez ou contactez le support
╚══════════════════════╝
╔═════◇
║❒ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄: https://youtube.com/@dybytech00
║❒ 𝐎𝐖𝐍𝐄𝐑: https://wa.me/50934960331
║❒ 𝐑𝐄𝐏𝐎: https://github.com/DybyTech/MEGALODON-MD
║❒ 𝐂𝐇𝐀𝐍𝐍𝐄𝐋: https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g
╚══════════════════════╝`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                forwardingScore: 2,
                                isForwarded: true,
                                mentionedJid: [sock.user.id],
                                forwardedNewsletterMessageInfo: {
                                    newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐓𝐆",
                                    newsletterJid: "120363406273402002@newsletter",
                                    serverMessageId: 143
                                }
                            }
                        }, { quoted: ddd });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("service restarted");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    await GIFTED_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit();
}, 180000);

module.exports = router;
