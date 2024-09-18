import nodemailer from 'nodemailer';

const user = process.env.SMTP_EMAIL || 'atiqah@cultcreative.asia';
const pass = process.env.SMTP_PASSWORD || 'qszpxgxbqxkmbfqy';

const transport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: user,
    pass: pass,
  },
});

// const mailOptions = {
//   from: {
//     name: 'Atiqah',
//     address: user,
//   },
//   to: 'afiq@nexea.co',
//   subject: 'Testing',
//   text: 'Hello Afiq',
//   html: `<b>Hello Afiq</b>`,
// };

// const sendMail = async (transport: any, mailOptions: any) => {
//   try {
//     await transport.sendMail(mailOptions);
//     console.log(`Email has been sent.`);
//   } catch (error) {
//     console.log(error);
//   }
// };

// sendMail(transport, mailOptions);

export const AdminInvitaion = (email: string, confirmationCode: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: '[Cult Creative] Please complete your registration',
      html: `
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>verfiy your account </title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; background: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h1 style="margin: 0 0 20px;">Welcome to our  System!</h1>
          <p style="margin: 0 0 20px;">You have been invited to join our system as an admin.</p>
          <p style="margin: 0 0 20px;">Please click on the following link to complete your registration:</p>
          <a href="http://localhost/auth/jwt/adminForm?token=${confirmationCode}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Complete Registration</a>
          <p style="margin: 20px 0 0;">If you did not request this invitation, please ignore this email.</p>
        </div>
      </body>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const AdminInvite = (email: string, inviteCode: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: '[Cult Creative] Please complete your registration',
      html: `
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>verfiy your account </title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; background: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h1 style="margin: 0 0 20px;">Welcome to our  System!</h1>
          <p style="margin: 0 0 20px;">You have been invited to join our system as an admin.</p>
          <p style="margin: 0 0 20px;">Please click on the following link to complete your registration:</p>
          <a href="${process.env.BASE_EMAIL_URL}/admin/form/token=${inviteCode}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Complete Registration</a>
          <p style="margin: 20px 0 0;">If you did not request this invitation, please ignore this email.</p>
        </div>
      </body>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const creatorVerificationEmail = (email: string, confirmationToken: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: 'Your Cult Creative Sign in Link',
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
      <style>
        /* Reset styles */
        body, h1, p {
          margin: 0;
          padding: 0;
        }
    
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        }
    
        .container {
          max-width: 300px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1 {
          color: #333333;
          margin-bottom: 20px;
        }
    
        p {
          color: #666666;
          margin-bottom: 20px;
          text-align:center;
          font-size: 13px;
        }
    
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #000000;
          text-decoration: none;
          border-radius: 5px;
          font-size: 13px;
          width: 80%;
        }
        
        .title{
            font-weight: bold;
            text-align: center;
        }
        
        .btn-container{
            text-align: center;
            margin: 20px 0;
            width: 100%;
        }

      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="title">Cult Creative</h1>
        <hr />
        <p>To use Cult Creative Platform, click the verification button. This helps keep your account secure.</p>
        <div class="btn-container">
        <a href="${process.env.BASE_EMAIL_URL}/auth/verify/${confirmationToken}" class="button" style="color: white;">Verify my account</a>
        </div>        
        <p>You're receiving this email because you have an account in Cult Creative Platform. If you are not sure why you're receiving this, please contact us by replying to this email.</p>
      </div>
    </body>
    </html>
    
          `,
    })
    .catch((err) => {
      return err;
    });
};

// Creator Notifications

export const shortlisted = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `🎉 You’ve Been Shortlisted for ${campaignName}!`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎉 You’ve Been Shortlisted for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">🎉 You’ve Been Shortlisted for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, Congrats! You've been shortlisted for <a href="#" style="color: #0874dc;">${campaignName}</a>. Stay tuned for updates!</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const firstDraftDue = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `First Draft for ${campaignName} Due Soon`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>First Draft for ${campaignName} Due Soon</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">First Draft for ${campaignName} Due Soon</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, Reminder: your first draft is due soon!</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const feedbackOnDraft = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Feedback on Your ${campaignName} Draft`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback on Your ${campaignName} Draft</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Feedback on Your ${campaignName} Draft</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, We’ve provided feedback on your draft.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const finalDraftDue = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Final Draft for ${campaignName} Due Soon`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Final Draft for ${campaignName} Due Soon</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Final Draft for ${campaignName} Due Soon</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, A reminder that your final draft is due soon.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const approvalOfDraft = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Your Draft for ${campaignName} Is Approved!`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Draft for ${campaignName} Is Approved!</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Your Draft for ${campaignName} Is Approved!</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, Great news! Your draft has been approved.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const postingSchedule = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `New Posting Schedule for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Posting Schedule for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">New Posting Schedule for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, The posting schedule is now available.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const trackingNumber = (email: string, campaignName: string, creatorName: string, trackingNumber: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Logistics Submitted for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logistics Submitted for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Logistics Submitted for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, Your logistics have been submitted, tracking number ${trackingNumber}.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const deliveryConfirmation = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Logistics Delivered for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logistics Delivered for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Logistics Delivered for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, The logistics have been delivered.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Campaign Details</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const creatorInvoice = (email: string, campaignName: string, creatorName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Invoice Generated for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Generated for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Invoice Generated for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${creatorName}, An invoice has been generated for your campaign.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Invoice</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you have any questions, please email us at <a href="mailto:hello@cultcreative.asia" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">hello@cultcreative.asia</a> or send us a text on <a href="https://api.whatsapp.com/send/?phone=60162678757&text&type=phone_number&app_absent=0" style="color: #0874dc; font-weight: bold; font-size: 12px; text-decoration: none;">Whatsapp at +60162678757</a>.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

// Admin Notifications

export const csmAdminInvoice = (email: string, campaignName: string, adminName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `Invoice Generated for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Generated for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">Invoice Generated for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${adminName}, An invoice has been generated.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Invoice on Dashboard</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you encounter any issues, please access the <a href="#">Dashboard</a> and navigate to the Campaign section for detailed information.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

export const financeAdminInvoice = (email: string, campaignName: string, adminName: string) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: `New Invoice Generated for ${campaignName}`,
      html: `
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Invoice Generated for ${campaignName}</title>
      </head>
      
      <body style="margin: 0; padding: 20px; background-color: #f5f5f7; font-family: Arial, sans-serif;">
      <div class="container" style="max-width: 420px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 0.1px dashed #777777; border-radius: 10px;">
      <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Company Logo" class="logo" style="max-width: 150px; margin-right: 30px;">
      </div>
        <h2 style="color: #686464; font-size: 24px; font-weight: bold; margin-top: 40px; margin-bottom: 40px;">New Invoice Generated for ${campaignName}</h2>
        <img src="https://drive.google.com/uc?id=1lpDBTeil5asnkSW7B7T7_77EFpTQJcva" alt="Campaign Image" class="campaign-image" style="display: block; width: 100%; max-height: 300px; object-fit: cover; margin: 30px 0;">
        <p style="color: #686464; text-align: left; font-size: 14px; line-height: 1.6; font-family: 'Roboto', sans-serif;">Hi ${adminName}, A new invoice has been generated.</p>
        <a href="#" class="button" style="display: inline-block; padding: 15px 30px; background-color: #0874dc; text-decoration: none; border-radius: 6px; font-size: 16px; color: #ffffff; text-align: center; margin: 30px auto; display: block; font-weight: bold; transition: background-color 0.3s;">View Invoice on Dashboard</a>
        <div class="separator" style="border-top: 1px solid #ddd; margin: 35px 0;"></div>
        <p id="slogan" style="color: #686464; font-size: 12px; padding-top: 0px; display: block; text-align: center; font-weight: bold; margin-bottom: 20px;">Where Brands and Creatives Co-create</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 20px;">
            <tr>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.instagram.com/cultcreativeasia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1WTjbjcjJ7JW_gC5rL426nLs_EmZi98Qp" alt="Instagram" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.youtube.com/@cultcreativeapp" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=18P3sGw7JTbeHIZVYA1XB_psp9bZvngHr" alt="YouTube" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.facebook.com/CultCreativeAsia/" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=15qY40yjw3Jeh5BoKUkjj6730RsolyK9E" alt="Facebook" style="width: 25px; height: auto;">
                    </a>
                </td>
                <td align="center" style="padding: 0 10px;">
                    <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                        <img src="https://drive.google.com/uc?id=1yt8fs0K1om0wsHD8LWFFysovkeIMgmg2" alt="Website" style="width: 25px; height: auto;">
                    </a>
                </td>
            </tr>
        </table>

        <div class="footer" style="font-size: 12px; color: #686464; text-align: left; margin-top: 40px; padding: 0 20px; position: relative;">
            <a href="https://www.cultcreative.asia" target="_blank" style="text-decoration: none;">
                <img src="https://drive.google.com/uc?id=13ICuo00aWLG8XUikZ_6vSP7ej_CFQdjQ" alt="Footer Logo" style="max-width: 60px; display: block;">
            </a>
            <p id="company-reg" style="color: #686464; font-size: 11px; padding-top: 0px;">202001018157 (1374477-W) <br> 2024 &copy; Cult Creative. All Rights Reserved.</p>
            <p>If you encounter any issues, please access the <a href="#">Dashboard</a> and navigate to the Campaign section for detailed information.</p>
        </div>
    </div>

</body>
</html>
          `,
    })
    .catch((err) => {
      return err;
    });
};

