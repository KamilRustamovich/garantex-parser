export const getEmailTemplate = (
    email: string,
    code: string,
    url: string,
): string => {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Avata Email Verify</title>
      </head>
      <body style="margin: 0;">
          <div style="
          background: #0e0e15;
          font-family: Aria, Helvetica, sans-serif;">
            <table style="
            width: 100%;
            text-align: center;
            height: 160px;
            background: #222227;
            font-size: 0;
          ">
              <thead>
              <tr>
                <td style="padding: 0"></td>
                <td width="90%" style="overflow: hidden; padding: 0;">
                  <div style="background-image: url('${url}/logo'); height: 160px; background-repeat: no-repeat; background-position: center"></div>
                </td>
                <td style="padding: 0"></td>
              </tr>
              </thead>
            </table>
            <div style="padding: 64px;">
          <span
            style="text-transform: uppercase; font-size: 22px; font-weight: 700; color: #fff;">
            Confirm your email address
          </span>
              <div style="margin: 44px 0 12px; font-size: 18px; font-weight: 700; color: #fff;">
                Hello ${email}!
              </div>
              <span style="font-size: 18px; color: #FAF9FC;">
                Please copy the code below to confirm your email address.
            </span>
              <div
                style="
              padding: 22px 0;
              background: white;
              color: #da0303;
              font-size: 30px;
              font-weight: 700;
              border-radius: 12px;
              margin: 40px 0 12px;
              text-align: center;
            ">
                ${code}
              </div>
              <div style="
              font-size: 13px;
              color: #f6f8fb;
              font-weight: 400;
              text-align: center;">
                This code will be valid for 30 minutes. Please do not share this code
                with anyone.
              </div>
              <div style="font-size: 18px; margin: 56px 0 12px; color: #fff;">
                Once completed this email address will be uniquely identified with your
                account.
              </div>
              <span style="font-size: 18px; font-weight: 700; color: #FBFAFF;">
                Best, The AVATA team!
              </span>
            </div>
          </div>
      </body>
    </html>
    `
}
