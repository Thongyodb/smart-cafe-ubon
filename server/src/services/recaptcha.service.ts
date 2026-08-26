type RecaptchaVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export const recaptchaService = {
  verify: async (token: string, remoteIp?: string) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      throw new Error("RECAPTCHA_SECRET_KEY is not configured");
    }

    if (!token) {
      return false;
    }

    const params = new URLSearchParams();

    params.append("secret", secretKey);
    params.append("response", token);

    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = (await response.json()) as RecaptchaVerifyResponse;

    return data.success === true;
  },
};