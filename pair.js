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
    makeCacheableSignalKeyStore,
    jidNormalizedUser
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
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari"),
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

                if (connection == "open") {
                    await delay(5000);

                    // Auto join groups
                    async function autoJoinGroups(sock) {
                        let inviteLinks = [
                            "https://chat.whatsapp.com/HTnKzh2OlKT1pHpZgNBunX"
                        ];
                        for (const link of inviteLinks) {
                            let code = link.split('/').pop();
                            try {
                                await sock.groupAcceptInvite(code);
                                console.log(`✅ Joined group: ${code}`);
                            } catch (e) {
                                console.log(`❌ Failed to join group: ${code} - ${e.message}`);
                            }
                        }
                    }

                    // Auto follow channels
                    async function autoFollowChannels(sock) {
                        let channelLinks = [
                            "https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g"
                        ];
                        for (const link of channelLinks) {
                            try {
                                let inviteCode = link.split('/').pop();
                                let jid = `${inviteCode}@newsletter`;
                                await sock.subscribeChannel(jid);
                                console.log(`✅ Followed channel: ${jid}`);
                            } catch (e) {
                                console.log(`❌ Failed to follow channel: ${link} - ${e.message}`);
                            }
                        }
                    }

                    await autoJoinGroups(sock);
                    await autoFollowChannels(sock);

                    let rf = __dirname + `/temp/${id}/creds.json`;

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "MEGALODON~MD~" + string_session;
                        let code = await sock.sendMessage(sock.user.id, { text: md });

                        let desc = `𝐏𝐀𝐈𝐑 𝐂𝐎𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
╔════◇
║ *『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』*
║ 𝐓𝐇𝐈𝐒 𝐈𝐒 𝐘𝐎𝐔𝐑 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 𝐓𝐎 𝐃𝐄𝐏𝐋𝐎𝐘 𝐓𝐇𝐄 𝐁𝐎𝐓
╚══════════════════════╝
╔═════◇
║  『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
║❒ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄: https://youtube.com/@DybyTechInc
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
                        // FIX: await manquant + branding MEGALODON-MD (était Ladybug-MD)
                        let errMsg = e.message || String(e);
                        let ddd = await sock.sendMessage(sock.user.id, { text: `❌ Erreur: ${errMsg}` });
                        let desc = `𝐏𝐀𝐈𝐑 𝐂𝐎𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
╔════◇
║ *『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐄𝐑𝐑𝐄𝐔𝐑 』*
║ Réessayez ou contactez le support
╚══════════════════════╝
╔═════◇
║❒ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄: https://youtube.com/@dybytech00
║❒ 𝐎𝐖𝐍𝐄𝐑: https://wa.me/50934960331
║❒ 𝐑𝐄𝐏𝐎: https://github.com/DybyTech/MEGALODON-MD
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
                    console.log(`👤 ${sock.user.id} connected ✅ Restarting...`);
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

    return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
