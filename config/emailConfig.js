// backend/config/emailConfig.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendConfirmationEmail = async (email, nom, prenom) => {
  const mailOptions = {
    from: `"AFO - All For One" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Candidature validée - Bienvenue chez AFO !',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; overflow: hidden; border: 2px solid #3b82f6; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .content h2 { color: #34d399; font-size: 24px; margin-bottom: 20px; }
            .content p { line-height: 1.6; color: #cbd5e1; margin-bottom: 20px; }
            .info-box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Félicitations ${prenom} ${nom} ! 🎊</h1>
            </div>
            <div class="content">
              <h2>Votre candidature a été validée avec succès ✅</h2>
              
              <p>
                C’est officiel — vous êtes désormais membre de <strong>All For One</strong> ! 💙  
                Vous pouvez dès à présent vous connecter à votre compte et rejoindre notre communauté engagée.
              </p>
              
              <div class="info-box">
                <p style="margin: 0; color: #34d399; font-weight: bold; font-size: 18px;">
                  👏 Bienvenue dans la famille AFO !
                </p>
                <p style="color: #cbd5e1; margin: 10px 0 0 0;">
                  Connectez-vous dès maintenant avec vos identifiants pour accéder à votre espace membre.
                </p>
              </div>
              
              <p>
                📋 <strong>Vos informations :</strong>
              </p>
              <ul style="color: #cbd5e1;">
                <li>Nom : ${nom}</li>
                <li>Prénom : ${prenom}</li>
                <li>Email : ${email}</li>
              </ul>
              
              <p style="margin-top: 30px;">
                Merci de rejoindre notre mission d’éducation et de solidarité. Ensemble, faisons la différence ! 🌍✨
              </p>
            </div>
            <div class="footer">
              <p>AFO - All For One © 2025 | Association pour l'éducation</p>
              <p>Si vous n'êtes pas à l'origine de cette inscription, veuillez ignorer cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmation envoyé à:', email);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

  // ✅ NOUVEAU : Email pour le code de réinitialisation
const sendResetCodeEmail = async (email, nom, resetCode) => {
  const mailOptions = {
    from: `"AFO - All For One" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Code de réinitialisation - AFO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; overflow: hidden; border: 2px solid #f59e0b; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .content h2 { color: #fbbf24; font-size: 24px; margin-bottom: 20px; }
            .content p { line-height: 1.6; color: #cbd5e1; margin-bottom: 20px; }
            .code-box { background: rgba(251, 191, 36, 0.1); border: 2px solid rgba(251, 191, 36, 0.3); border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
            .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 15px; margin: 20px 0; }
            .footer { background: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation du mot de passe</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${nom} ! 👋</h2>
              
              <p>
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>All For One</strong>.
              </p>
              
              <p style="color: #fbbf24; font-weight: bold;">
                Voici votre code de sécurité à 6 chiffres :
              </p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">
                  ⏰ Ce code expire dans <strong>10 minutes</strong>
                </p>
              </div>
              
              <div class="warning-box">
                <p style="margin: 0; color: #fca5a5; font-size: 14px;">
                  ⚠️ <strong>Important :</strong> Si vous n'avez pas demandé cette réinitialisation, 
                  ignorez cet email et votre mot de passe restera inchangé.
                </p>
              </div>
              
              <p style="color: #cbd5e1; font-size: 14px;">
                📱 Saisissez ce code dans l'application pour créer un nouveau mot de passe.
              </p>
              
              <p style="margin-top: 30px; color: #94a3b8; font-size: 13px;">
                Pour votre sécurité, ne partagez jamais ce code avec personne.
              </p>
            </div>
            <div class="footer">
              <p>AFO - All For One © 2025 | Association pour l'éducation</p>
              <p>Si vous avez besoin d'aide, contactez-nous.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Code de réinitialisation envoyé à:', email);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

  

module.exports = { sendConfirmationEmail, sendResetCodeEmail };
