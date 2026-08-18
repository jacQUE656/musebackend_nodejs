import transporter from "../config/mailer.js";

const BRAND_COLOR = "#7c3aed"; // purple — adjust to match Muse's actual brand color
const BG_COLOR = "#0f0f10";
const CARD_COLOR = "#1a1a1c";
const TEXT_COLOR = "#f4f4f5";
const MUTED_COLOR = "#a1a1aa";

function baseLayout({ preheader = "", bodyHtml = "" }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Muse</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
    <!-- Preheader text (hidden, shows in inbox preview) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color:${CARD_COLOR}; border-radius: 16px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 0 32px; text-align:center;">
                <div style="font-size: 24px; font-weight: 700; color:${TEXT_COLOR}; letter-spacing: -0.5px;">
                  🎵 Muse
                </div>
              </td>
            </tr>

            <!-- Body -->
            ${bodyHtml}

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 32px 32px 32px; text-align:center; border-top: 1px solid #2a2a2d; margin-top: 24px;">
                <p style="margin: 16px 0 0 0; font-size: 12px; color:${MUTED_COLOR};">
                  You're receiving this because you have a Muse account.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function button(label, url) {
  if (!url) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto 0 auto;">
      <tr>
        <td style="border-radius: 999px; background-color:${BRAND_COLOR};">
          <a href="${url}" style="display:inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color:#ffffff; text-decoration:none; border-radius: 999px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

async function sendWelcomeEmail(to, firstname, lastname) {
  const bodyHtml = `
    <tr>
      <td style="padding: 24px 32px 8px 32px; text-align:center;">
        <div style="font-size: 40px; line-height:1;">👋</div>
        <h1 style="margin: 16px 0 0 0; font-size: 20px; color:${TEXT_COLOR};">
          Welcome, ${firstname} ${lastname}!
        </h1>
        <p style="margin: 12px 0 0 0; font-size: 14px; line-height:1.6; color:${MUTED_COLOR};">
          Your Muse account is ready. Upload tracks, build albums, and curate playlists — all in one place.
        </p>
        ${button("Open Muse", process.env.CLIENT_URL)}
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: `"Muse" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Welcome to Muse 🎵",
    html: baseLayout({ preheader: `Welcome to Muse, ${firstname}!`, bodyHtml }),
  });
}

async function sendNewSongNotification(recipients, song) {
  const coverImage = song.imageUrl
    ? `<img src="${song.imageUrl}" alt="${song.title}" width="160" height="160" style="border-radius: 12px; display:block; margin: 0 auto; object-fit: cover;" />`
    : `<div style="width:160px; height:160px; border-radius:12px; background-color:#2a2a2d; margin: 0 auto; display:flex; align-items:center; justify-content:center; font-size: 40px;">🎵</div>`;

  const bodyHtml = `
    <tr>
      <td style="padding: 24px 32px 8px 32px; text-align:center;">
        <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color:${BRAND_COLOR};">
          New Release
        </p>
        ${coverImage}
        <h1 style="margin: 20px 0 4px 0; font-size: 20px; color:${TEXT_COLOR};">
          ${song.title}
        </h1>
        <p style="margin: 0; font-size: 14px; color:${MUTED_COLOR};">
          ${song.artist}
        </p>
        ${song.description ? `<p style="margin: 16px 0 0 0; font-size: 14px; line-height:1.6; color:${MUTED_COLOR};">${song.description}</p>` : ""}
        ${button("Listen Now", `${process.env.CLIENT_URL}/songs/${song.id}`)}
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: `"Muse" <${process.env.GMAIL_USER}>`,
    bcc: recipients,
    subject: `New release: ${song.title} by ${song.artist}`,
    html: baseLayout({ preheader: `${song.artist} just dropped a new track on Muse`, bodyHtml }),
  });
}

async function sendAlbumNotification(recipients, album) {
  const coverImage = album.imageUrl
    ? `<img src="${album.imageUrl}" alt="${album.title}" width="160" height="160" style="border-radius: 12px; display:block; margin: 0 auto; object-fit: cover;" />`
    : `<div style="width:160px; height:160px; border-radius:12px; background-color:#2a2a2d; margin: 0 auto; display:flex; align-items:center; justify-content:center; font-size: 40px;">🎵</div>`;

  const bodyHtml = `
    <tr>
      <td style="padding: 24px 32px 8px 32px; text-align:center;">
        <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color:${BRAND_COLOR};">
          New Release
        </p>
        ${coverImage}
        <h1 style="margin: 20px 0 4px 0; font-size: 20px; color:${TEXT_COLOR};">
          ${song.title}
        </h1>
        <p style="margin: 0; font-size: 14px; color:${MUTED_COLOR};">
          ${song.artist}
        </p>
        ${album.description ? `<p style="margin: 16px 0 0 0; font-size: 14px; line-height:1.6; color:${MUTED_COLOR};">${album.description}</p>` : ""}
        ${button("Listen Now", `${process.env.CLIENT_URL}/albums/${album.id}`)}
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: `"Muse" <${process.env.GMAIL_USER}>`,
    bcc: recipients,
    subject: `New release: ${album.title} by ${album.artist}`,
    html: baseLayout({ preheader: `${album.artist} just dropped a new track on Muse`, bodyHtml }),
  });
}

async function sendNewPlaylistNotification(recipients, playlist) {
  const coverImage = playlist.imageUrl
    ? `<img src="${playlist.imageUrl}" alt="${playlist.name}" width="160" height="160" style="border-radius: 12px; display:block; margin: 0 auto; object-fit: cover;" />`
    : `<div style="width:160px; height:160px; border-radius:12px; background-color:#2a2a2d; margin: 0 auto; display:flex; align-items:center; justify-content:center; font-size: 40px;">🎵</div>`;

  const bodyHtml = `
    <tr>
      <td style="padding: 24px 32px 8px 32px; text-align:center;">
        <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color:${BRAND_COLOR};">
          New Release
        </p>
        ${coverImage}
        <h1 style="margin: 20px 0 4px 0; font-size: 20px; color:${TEXT_COLOR};">
          ${playlist.name}
        </h1>
        ${playlist.description ? `<p style="margin: 16px 0 0 0; font-size: 14px; line-height:1.6; color:${MUTED_COLOR};">${playlist.description}</p>` : ""}
        ${button("Listen Now", `${process.env.CLIENT_URL}/songs/${playlist.id}`)}
      </td>
    </tr>
  `;

  await transporter.sendMail({
    from: `"Muse" <${process.env.GMAIL_USER}>`,
    bcc: recipients,
    subject: `New release: ${playlist.name}`,
    html: baseLayout({ preheader: `${playlist.name} just dropped a new track on Muse`, bodyHtml }),
  });
}


export default { sendWelcomeEmail, sendNewSongNotification , sendAlbumNotification, sendNewPlaylistNotification};